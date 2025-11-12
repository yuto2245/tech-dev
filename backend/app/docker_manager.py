import contextlib
import os
import shlex
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Dict, Optional, Tuple, IO


class SandboxError(RuntimeError):
    """Base error type for sandbox operations."""


class SandboxUnavailable(SandboxError):
    """Raised when the selected sandbox runtime cannot be used."""


class SandboxExecutionError(SandboxError):
    """Raised when sandbox commands fail."""


class DockerUnavailable(SandboxUnavailable):
    """Backward compatible alias for sandbox runtime availability errors."""


class DockerExecutionError(SandboxExecutionError):
    """Backward compatible alias for sandbox execution errors."""


class DockerManager:
    """Manage lifecycle of sandbox containers using Docker."""

    def __init__(
        self,
        base_image: str = "agent-sandbox:latest",
        password: str = "secret",
        ttl_minutes: int = 30,
        host_port: Optional[int] = 6080,
        network_mode: str = "none",
        extra_args: Optional[list[str]] = None,
    ) -> None:
        self.base_image = base_image
        self.password = password
        self.ttl_seconds = ttl_minutes * 60
        self.host_port = host_port
        self.network_mode = network_mode
        self.extra_args = extra_args or []
        self._container_name: Optional[str] = None
        self._created_at: Optional[float] = None

    @property
    def container_name(self) -> Optional[str]:
        return self._container_name

    def _run(self, *args: str, check: bool = True) -> subprocess.CompletedProcess:
        binary = args[0] if args else "docker"
        docker_path = shutil.which(binary)
        if docker_path is None:
            raise DockerUnavailable(f"Required command '{binary}' is not available on PATH.")

        try:
            return subprocess.run(args, check=check, capture_output=True, text=True)
        except FileNotFoundError as exc:
            raise DockerUnavailable(f"Command '{binary}' could not be executed.") from exc
        except subprocess.CalledProcessError as exc:
            stderr = exc.stderr.strip() if exc.stderr else ""
            stdout = exc.stdout.strip() if exc.stdout else ""
            message = stderr or stdout or str(exc)
            raise DockerExecutionError(message) from exc

    def _should_publish_port(self) -> bool:
        return self.host_port is not None and self.network_mode.lower() != "host"

    def create_sandbox(self) -> str:
        if self._container_name and self._is_running():
            return self._container_name

        timestamp = int(time.time())
        self._container_name = f"sandbox-{timestamp}"
        self._created_at = time.time()

        cmd = [
            "docker",
            "run",
            "-d",
            "--rm",
            "--name",
            self._container_name,
            "--cpus",
            os.environ.get("SANDBOX_CPUS", "1"),
            "--memory",
            os.environ.get("SANDBOX_MEMORY", "512m"),
        ]

        if self.network_mode:
            cmd.extend(["--network", self.network_mode])

        if self._should_publish_port():
            cmd.extend(["-p", f"{self.host_port}:6080"])

        cmd.extend(self.extra_args)
        cmd.append(self.base_image)

        self._run(*cmd)
        return self._container_name

    def _is_running(self) -> bool:
        if not self._container_name:
            return False
        try:
            proc = self._run("docker", "ps", "-q", "-f", f"name={self._container_name}", check=False)
        except SandboxUnavailable:
            return False
        return bool(proc.stdout.strip())

    def ensure_started(self) -> str:
        if not self._container_name or not self._is_running():
            return self.create_sandbox()
        if self._created_at and time.time() - self._created_at > self.ttl_seconds:
            self.destroy_sandbox()
            return self.create_sandbox()
        return self._container_name

    def exec_in_sandbox(self, command: str) -> str:
        if not command.strip():
            raise ValueError("Command must not be empty")

        self.ensure_started()
        assert self._container_name is not None
        try:
            proc = self._run(
                "docker",
                "exec",
                self._container_name,
                "bash",
                "-lc",
                command,
                check=False,
            )
        except SandboxUnavailable as exc:
            raise DockerUnavailable("Docker CLI is required to execute sandbox commands.") from exc

        if proc.returncode != 0:
            stderr = proc.stderr.strip()
            stdout = proc.stdout.strip()
            message = stderr or stdout or "Command failed"
            return f"[error] {message}"
        return proc.stdout.strip()

    def get_vnc_url(self, host: str, password: Optional[str] = None) -> str:
        passwd = password or self.password
        port = self.host_port if self.host_port is not None else 6080
        return f"http://{host}:{port}/vnc.html?password={passwd}"

    def destroy_sandbox(self) -> None:
        if not self._container_name:
            return
        try:
            self._run("docker", "stop", self._container_name, check=False)
        except SandboxUnavailable:
            pass
        self._container_name = None
        self._created_at = None


class NativeSandboxManager:
    """Run the sandbox directly on the host using Xvfb + x11vnc + noVNC."""

    def __init__(
        self,
        password: str = "secret",
        ttl_minutes: int = 30,
        host_port: int = 6080,
        display: str = ":99",
        width: int = 1280,
        height: int = 800,
        vnc_port: int = 5901,
    ) -> None:
        self.password = password
        self.ttl_seconds = ttl_minutes * 60
        self.host_port = host_port
        self.display = display
        self.width = width
        self.height = height
        self.vnc_port = vnc_port
        self._workspace: Optional[Path] = None
        self._procs: Dict[str, Tuple[subprocess.Popen, Optional[IO[str]]]] = {}
        self._created_at: Optional[float] = None

    def _require(self, *binaries: str) -> None:
        for binary in binaries:
            if shutil.which(binary) is None:
                raise SandboxUnavailable(f"Required command '{binary}' is not available. Install desktop/VNC dependencies.")

    def _workspace_dir(self) -> Path:
        if self._workspace is None:
            self._workspace = Path(tempfile.mkdtemp(prefix="sandbox-native-"))
        self._workspace.mkdir(parents=True, exist_ok=True)
        runtime_dir = self._workspace / "runtime"
        runtime_dir.mkdir(parents=True, exist_ok=True)
        os.chmod(runtime_dir, 0o700)
        return self._workspace

    def _env(self) -> dict[str, str]:
        workspace = self._workspace_dir()
        env = os.environ.copy()
        env.setdefault("LANG", "en_US.UTF-8")
        env["DISPLAY"] = self.display
        env["HOME"] = str(workspace)
        env["USER"] = env.get("USER", "sandbox")
        env["XDG_RUNTIME_DIR"] = str(workspace / "runtime")
        env["SHELL"] = "/bin/bash"
        return env

    def _store_password(self, env: dict[str, str]) -> Path:
        passwd_file = self._workspace_dir() / ".vncpass"
        if not passwd_file.exists():
            self._require("x11vnc")
            subprocess.run(
                ["x11vnc", "-storepasswd", self.password, str(passwd_file)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                env=env,
            )
        return passwd_file

    def _start_process(self, name: str, args: list[str], env: dict[str, str]) -> None:
        log_path = self._workspace_dir() / f"{name}.log"
        log_file = open(log_path, "w", encoding="utf-8")
        proc = subprocess.Popen(
            args,
            env=env,
            cwd=self._workspace_dir(),
            stdout=log_file,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        self._procs[name] = (proc, log_file)

    def _wait_for_process(self, name: str, delay: float = 0.5) -> None:
        time.sleep(delay)
        proc, _ = self._procs.get(name, (None, None))
        if proc is not None and proc.poll() is not None:
            raise SandboxExecutionError(f"Process '{name}' exited unexpectedly. Check sandbox logs for details.")

    def create_sandbox(self) -> str:
        if self._is_running():
            return "native"

        self._require("Xvfb", "x11vnc", "websockify")
        env = self._env()
        passwd_file = self._store_password(env)

        try:
            self._start_process(
                "xvfb",
                ["Xvfb", self.display, "-screen", "0", f"{self.width}x{self.height}x24"],
                env,
            )
            self._wait_for_process("xvfb", delay=1.0)

            self._start_process(
                "x11vnc",
                [
                    "x11vnc",
                    "-display",
                    self.display,
                    "-rfbauth",
                    str(passwd_file),
                    "-rfbport",
                    str(self.vnc_port),
                    "-forever",
                    "-shared",
                ],
                env,
            )
            self._wait_for_process("x11vnc", delay=1.0)

            self._start_process(
                "websockify",
                [
                    "websockify",
                    "--web=/usr/share/novnc/",
                    str(self.host_port),
                    f"localhost:{self.vnc_port}",
                ],
                env,
            )
            self._wait_for_process("websockify", delay=1.0)

            if shutil.which("startxfce4"):
                session_base = ["startxfce4"]
            elif shutil.which("xfce4-session"):
                session_base = ["xfce4-session"]
            else:
                raise SandboxUnavailable("XFCE セッションを起動できません。xfce4-session/startxfce4 を確認してください。")

            session_cmd = session_base
            if shutil.which("dbus-launch"):
                session_cmd = ["dbus-launch", "--exit-with-session"] + session_base

            self._start_process("session", session_cmd, env)
            self._wait_for_process("session", delay=2.0)
        except Exception:
            self.destroy_sandbox()
            raise

        self._created_at = time.time()
        return "native"

    def _is_running(self) -> bool:
        if not self._procs:
            return False
        for proc, _ in self._procs.values():
            if proc.poll() is not None:
                return False
        return True

    def ensure_started(self) -> str:
        if not self._is_running():
            return self.create_sandbox()
        if self._created_at and time.time() - self._created_at > self.ttl_seconds:
            self.destroy_sandbox()
            return self.create_sandbox()
        return "native"

    def exec_in_sandbox(self, command: str) -> str:
        if not command.strip():
            raise ValueError("Command must not be empty")

        self.ensure_started()
        env = self._env()
        result = subprocess.run(
            ["bash", "-lc", command],
            capture_output=True,
            text=True,
            env=env,
            cwd=self._workspace_dir(),
        )
        if result.returncode != 0:
            stderr = result.stderr.strip()
            stdout = result.stdout.strip()
            message = stderr or stdout or "Command failed"
            return f"[error] {message}"
        return result.stdout.strip()

    def get_vnc_url(self, host: str, password: Optional[str] = None) -> str:
        passwd = password or self.password
        return f"http://{host}:{self.host_port}/vnc.html?password={passwd}"

    def destroy_sandbox(self) -> None:
        for name, (proc, log_file) in list(self._procs.items()):
            if proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    proc.kill()
            if log_file is not None:
                with contextlib.suppress(Exception):
                    log_file.close()
            self._procs.pop(name, None)
        self._created_at = None
        workspace = self._workspace
        self._workspace = None
        if workspace and workspace.exists():
            with contextlib.suppress(Exception):
                shutil.rmtree(workspace)


SANDBOX_IMAGE = os.environ.get("SANDBOX_IMAGE", "agent-sandbox:latest")
SANDBOX_PASSWORD = os.environ.get("SANDBOX_PASSWORD", "secret")
SANDBOX_PORT = int(os.environ.get("SANDBOX_PORT", "6080"))
SANDBOX_TTL = int(os.environ.get("SANDBOX_TTL", "30"))
SANDBOX_RUNTIME = os.environ.get("SANDBOX_RUNTIME", "docker").lower()
SANDBOX_NETWORK_MODE = os.environ.get("SANDBOX_NETWORK_MODE", "none")
SANDBOX_DOCKER_ARGS = shlex.split(os.environ.get("SANDBOX_DOCKER_ARGS", ""))
SANDBOX_NATIVE_DISPLAY = os.environ.get("SANDBOX_NATIVE_DISPLAY", ":99")
SANDBOX_NATIVE_WIDTH = int(os.environ.get("SANDBOX_NATIVE_WIDTH", "1280"))
SANDBOX_NATIVE_HEIGHT = int(os.environ.get("SANDBOX_NATIVE_HEIGHT", "800"))
SANDBOX_NATIVE_VNC_PORT = int(os.environ.get("SANDBOX_NATIVE_VNC_PORT", "5901"))


def build_manager():
    if SANDBOX_RUNTIME == "native":
        return NativeSandboxManager(
            password=SANDBOX_PASSWORD,
            ttl_minutes=SANDBOX_TTL,
            host_port=SANDBOX_PORT,
            display=SANDBOX_NATIVE_DISPLAY,
            width=SANDBOX_NATIVE_WIDTH,
            height=SANDBOX_NATIVE_HEIGHT,
            vnc_port=SANDBOX_NATIVE_VNC_PORT,
        )
    return DockerManager(
        base_image=SANDBOX_IMAGE,
        password=SANDBOX_PASSWORD,
        ttl_minutes=SANDBOX_TTL,
        host_port=SANDBOX_PORT,
        network_mode=SANDBOX_NETWORK_MODE,
        extra_args=SANDBOX_DOCKER_ARGS,
    )

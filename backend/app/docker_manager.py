import os
import shutil
import subprocess
import time
from typing import Optional


class DockerUnavailable(RuntimeError):
    """Raised when the Docker CLI is not accessible."""


class DockerExecutionError(RuntimeError):
    """Raised when a Docker command fails to execute successfully."""


class DockerManager:
    """Manage lifecycle of sandbox containers used for interactive sessions."""

    def __init__(
        self,
        base_image: str = "agent-sandbox:latest",
        password: str = "secret",
        ttl_minutes: int = 30,
        host_port: int = 6080,
    ) -> None:
        self.base_image = base_image
        self.password = password
        self.ttl_seconds = ttl_minutes * 60
        self.host_port = host_port
        self._container_name: Optional[str] = None
        self._created_at: Optional[float] = None

    @property
    def container_name(self) -> Optional[str]:
        return self._container_name

    def _run(self, *args: str, check: bool = True) -> subprocess.CompletedProcess:
        docker_path = shutil.which(args[0]) if args else None
        if docker_path is None and args and args[0] == "docker":
            raise DockerUnavailable("Docker CLI is not available on PATH.")

        try:
            return subprocess.run(args, check=check, capture_output=True, text=True)
        except FileNotFoundError as exc:
            raise DockerUnavailable("Docker CLI could not be executed.") from exc
        except subprocess.CalledProcessError as exc:
            stderr = exc.stderr.strip() if exc.stderr else ""
            stdout = exc.stdout.strip() if exc.stdout else ""
            message = stderr or stdout or str(exc)
            raise DockerExecutionError(message) from exc

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
            "--network",
            "none",
            "--cpus",
            os.environ.get("SANDBOX_CPUS", "1"),
            "--memory",
            os.environ.get("SANDBOX_MEMORY", "512m"),
            "-p",
            f"{self.host_port}:6080",
            self.base_image,
        ]
        self._run(*cmd)
        return self._container_name

    def _is_running(self) -> bool:
        if not self._container_name:
            return False
        try:
            proc = self._run("docker", "ps", "-q", "-f", f"name={self._container_name}", check=False)
        except DockerUnavailable:
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
        except DockerUnavailable as exc:
            raise DockerUnavailable("Docker CLI is required to execute sandbox commands.") from exc

        if proc.returncode != 0:
            stderr = proc.stderr.strip()
            stdout = proc.stdout.strip()
            message = stderr or stdout or "Command failed"
            return f"[error] {message}"
        return proc.stdout.strip()

    def get_vnc_url(self, host: str, password: Optional[str] = None) -> str:
        passwd = password or self.password
        return f"http://{host}:{self.host_port}/vnc.html?password={passwd}"

    def destroy_sandbox(self) -> None:
        if not self._container_name:
            return
        try:
            subprocess.run(["docker", "stop", self._container_name], check=False, capture_output=True)
        except FileNotFoundError as exc:
            raise DockerUnavailable("Docker CLI could not be executed.") from exc
        self._container_name = None
        self._created_at = None


SANDBOX_IMAGE = os.environ.get("SANDBOX_IMAGE", "agent-sandbox:latest")
SANDBOX_PASSWORD = os.environ.get("SANDBOX_PASSWORD", "secret")
SANDBOX_PORT = int(os.environ.get("SANDBOX_PORT", "6080"))
SANDBOX_TTL = int(os.environ.get("SANDBOX_TTL", "30"))


def build_manager() -> DockerManager:
    return DockerManager(
        base_image=SANDBOX_IMAGE,
        password=SANDBOX_PASSWORD,
        ttl_minutes=SANDBOX_TTL,
        host_port=SANDBOX_PORT,
    )

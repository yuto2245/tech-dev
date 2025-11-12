#!/usr/bin/env python3
"""Utility to diagnose sandbox prerequisites before running the demo."""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

REQUIRED_TOOLS = {
    "docker": "Docker CLI is required for the containerized sandbox runtime.",
    "uvicorn": "Uvicorn serves the FastAPI backend.",
    "npm": "npm is needed to build and run the Vite frontend.",
}

NATIVE_FALLBACK_TOOLS = {
    "Xvfb": "Xvfb provides the virtual display for the native sandbox runtime.",
    "x11vnc": "x11vnc shares the X display so noVNC can connect.",
    "websockify": "websockify bridges VNC to WebSockets for noVNC.",
}


def check_command(name: str) -> bool:
    return shutil.which(name) is not None


def format_status(name: str, ok: bool) -> str:
    return f"[{'OK' if ok else 'MISSING'}] {name}"


def run_docker_info() -> tuple[bool, str]:
    if not check_command("docker"):
        return False, "Docker CLI not found on PATH."
    try:
        subprocess.run(["docker", "info"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True, "Docker daemon reachable."
    except subprocess.CalledProcessError as exc:
        return False, exc.stderr.decode() or exc.stdout.decode() or str(exc)
    except FileNotFoundError:
        return False, "Docker CLI not executable."


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Diagnose sandbox prerequisites.")
    parser.add_argument(
        "--native",
        action="store_true",
        help="Check for the native Xvfb/x11vnc toolchain instead of Docker.",
    )
    parser.add_argument(
        "--details",
        action="store_true",
        help="Print additional context for each requirement.",
    )
    args = parser.parse_args(argv)

    missing = False

    tools = NATIVE_FALLBACK_TOOLS if args.native else REQUIRED_TOOLS

    print("Sandbox prerequisite check")
    print("===========================")

    for name, description in tools.items():
        ok = check_command(name)
        if not ok:
            missing = True
        print(format_status(name, ok))
        if args.details:
            print(f"    {description}")

    if not args.native:
        ok, message = run_docker_info()
        print(format_status("docker daemon", ok))
        if args.details:
            print("    " + message.strip())
        if not ok:
            missing = True

    if missing:
        print("\nOne or more prerequisites are missing. See README.md for installation guidance.")
        return 1

    print("\nAll prerequisites satisfied. You are ready to start the sandbox demo.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

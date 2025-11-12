from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .docker_manager import (
    SandboxExecutionError,
    SandboxUnavailable,
    build_manager,
)

app = FastAPI(title="Agent Sandbox API", version="0.1.0")

docker_manager = build_manager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommandRequest(BaseModel):
    command: str


class SandboxResponse(BaseModel):
    url: str


class CommandResponse(BaseModel):
    command: str
    output: str


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/sandbox/start", response_model=SandboxResponse)
def start_sandbox(host: str = "localhost"):
    try:
        docker_manager.ensure_started()
    except SandboxUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except SandboxExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    url = docker_manager.get_vnc_url(host=host)
    return SandboxResponse(url=url)


@app.get("/sandbox/url", response_model=SandboxResponse)
def get_sandbox_url(host: str = "localhost"):
    try:
        docker_manager.ensure_started()
    except SandboxUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except SandboxExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    url = docker_manager.get_vnc_url(host=host)
    return SandboxResponse(url=url)


@app.post("/sandbox/exec", response_model=CommandResponse)
def exec_command(payload: CommandRequest):
    try:
        output = docker_manager.exec_in_sandbox(payload.command)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SandboxUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except SandboxExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    return CommandResponse(command=payload.command, output=output)


@app.post("/sandbox/stop")
def stop_sandbox() -> dict[str, str]:
    try:
        docker_manager.destroy_sandbox()
    except SandboxUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return {"status": "stopped"}

from __future__ import annotations

import errno
from typing import Iterable

import uvicorn


HOST = "0.0.0.0"
PORT_CANDIDATES: tuple[int, ...] = (8000, 8001, 8010)


def is_bind_error(exc: OSError) -> bool:
    win_error = getattr(exc, "winerror", None)
    return exc.errno in {errno.EACCES, errno.EADDRINUSE} or win_error in {10013, 10048}


def run_with_fallback(host: str, ports: Iterable[int]) -> None:
    last_error: OSError | None = None
    for port in ports:
        try:
            print(f"[backend] Starting FastAPI on http://{host}:{port}")
            uvicorn.run(
                "app:app",
                host=host,
                port=port,
                reload=True,
                app_dir="backend",
            )
            return
        except OSError as exc:
            if not is_bind_error(exc):
                raise
            last_error = exc
            print(f"[backend] Port {port} unavailable ({exc}). Trying next port...")

    ports_list = ", ".join(str(p) for p in ports)
    raise RuntimeError(f"Could not bind backend to any configured port: {ports_list}") from last_error


if __name__ == "__main__":
    run_with_fallback(HOST, PORT_CANDIDATES)

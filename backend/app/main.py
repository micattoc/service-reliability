import time
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()  # Load backend/.env for local dev

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.poller import start_scheduler, stop_scheduler
from app.routes.services import router as services_router

STATIC_DIR = Path(__file__).parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retry DB initialisation on startup, to allow for cases where the database isn't immediately available
    for attempt in range(10):
        try:
            init_db()
            print("[STARTUP] Database tables verified.")
            break
        except Exception as exc:
            if attempt == 9:
                raise RuntimeError(f"[STARTUP] Cannot connect to database: {exc}")
            print(f"[STARTUP] DB not ready (attempt {attempt + 1}/10), retrying in 2s...")
            time.sleep(2)

    await start_scheduler()
    print(f"[STARTUP] Poller started. First poll running in background.")
    yield
    stop_scheduler()
    print("[SHUTDOWN] Poller stopped.")


app = FastAPI(
    title="Service Reliability Monitor",
    description="Periodically checks external service endpoints and surfaces health, latency, and version drift.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services_router)

# Serve React production build when running inside Docker
if STATIC_DIR.exists():
    assets_dir = STATIC_DIR / "assets"

    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        return FileResponse(str(STATIC_DIR / "index.html"))

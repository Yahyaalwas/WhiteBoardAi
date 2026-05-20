import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from pathlib import Path

from routes import upload_router, analysis_router
from config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path("uploads").mkdir(exist_ok=True)
    Path("results").mkdir(exist_ok=True)
    logger.info("BoardIQ API starting up")
    yield
    logger.info("BoardIQ API shutting down")


settings = get_settings()

app = FastAPI(
    title="BoardIQ API",
    description="AI-powered whiteboard intelligence backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(analysis_router, prefix="/api", tags=["analysis"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "BoardIQ API", "version": "1.0.0"}

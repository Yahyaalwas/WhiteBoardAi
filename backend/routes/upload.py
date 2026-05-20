from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uuid
import aiofiles
import os
from pathlib import Path
from vision.preprocessor import preprocess_whiteboard
from models.schemas import UploadResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_SIZE = 20 * 1024 * 1024  # 20MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"}


@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """Upload and preprocess a whiteboard image."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type {file.content_type} not supported. Use JPG, PNG, or WebP.")

    content = await file.read()

    if len(content) > MAX_SIZE:
        raise HTTPException(413, "File too large. Maximum size is 20MB.")

    session_id = str(uuid.uuid4())

    try:
        processed = preprocess_whiteboard(content)
    except Exception as e:
        logger.warning(f"Preprocessing failed: {e}, using original")
        processed = content

    # Save original and processed
    orig_path = UPLOAD_DIR / f"{session_id}_original.jpg"
    proc_path = UPLOAD_DIR / f"{session_id}_processed.jpg"

    async with aiofiles.open(orig_path, "wb") as f:
        await f.write(content)

    async with aiofiles.open(proc_path, "wb") as f:
        await f.write(processed)

    logger.info(f"Uploaded image: session={session_id}, size={len(content)} bytes")

    return UploadResponse(session_id=session_id)

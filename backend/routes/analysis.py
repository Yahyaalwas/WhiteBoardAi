from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import Response, StreamingResponse
import aiofiles
import os
import json
from pathlib import Path
from typing import Optional
from models.schemas import AnalysisResult, AnalyzeResponse
from services.claude_service import ClaudeService
from services.ocr_service import OCRService
from services.export_service import to_markdown, to_json, to_mermaid
from config import get_settings
import logging
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

_results_cache: dict[str, AnalysisResult] = {}


async def _run_analysis(session_id: str, settings) -> AnalysisResult:
    """Full analysis pipeline: OCR + Claude."""
    proc_path = UPLOAD_DIR / f"{session_id}_processed.jpg"
    orig_path = UPLOAD_DIR / f"{session_id}_original.jpg"

    img_path = proc_path if proc_path.exists() else orig_path
    if not img_path.exists():
        raise FileNotFoundError(f"Image not found for session {session_id}")

    async with aiofiles.open(img_path, "rb") as f:
        image_bytes = await f.read()

    # Step 1: OCR (optional — if configured)
    ocr_text = ""
    if settings.google_vision_api_key:
        ocr_service = OCRService(api_key=settings.google_vision_api_key)
        ocr_text = await ocr_service.extract_text(image_bytes)

    # Step 2: Claude analysis (vision + OCR text)
    claude = ClaudeService(api_key=settings.anthropic_api_key)
    result = await claude.analyze_whiteboard(image_bytes, session_id=session_id)

    # Add OCR text if available
    if ocr_text:
        result.extracted_text = ocr_text

    result.status = "complete"

    # Cache and persist result
    _results_cache[session_id] = result
    result_path = RESULTS_DIR / f"{session_id}.json"
    async with aiofiles.open(result_path, "w") as f:
        await f.write(result.model_dump_json(indent=2))

    return result


@router.post("/analyze/{session_id}", response_model=AnalyzeResponse)
async def start_analysis(session_id: str, background_tasks: BackgroundTasks):
    """Start async analysis of uploaded whiteboard."""
    proc_path = UPLOAD_DIR / f"{session_id}_processed.jpg"
    orig_path = UPLOAD_DIR / f"{session_id}_original.jpg"

    if not proc_path.exists() and not orig_path.exists():
        raise HTTPException(404, "Session not found. Please upload an image first.")

    # Mark as processing
    _results_cache[session_id] = AnalysisResult(id=session_id, status="processing")

    return AnalyzeResponse(analysis_id=session_id, status="processing")


@router.get("/results/{session_id}", response_model=AnalysisResult)
async def get_results(session_id: str, settings=Depends(get_settings)):
    """Get analysis results. Runs analysis if not yet complete."""
    # Check cache
    if session_id in _results_cache:
        cached = _results_cache[session_id]
        if cached.status == "complete":
            return cached

    # Check disk
    result_path = RESULTS_DIR / f"{session_id}.json"
    if result_path.exists():
        async with aiofiles.open(result_path) as f:
            data = await f.read()
        result = AnalysisResult.model_validate_json(data)
        _results_cache[session_id] = result
        return result

    # Run analysis synchronously
    try:
        result = await _run_analysis(session_id, settings)
        return result
    except FileNotFoundError:
        raise HTTPException(404, "Session not found")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@router.get("/export/{session_id}")
async def export_result(session_id: str, format: str = "json"):
    """Export analysis result in various formats."""
    result_path = RESULTS_DIR / f"{session_id}.json"

    if session_id not in _results_cache and not result_path.exists():
        raise HTTPException(404, "Results not found")

    if session_id in _results_cache:
        result = _results_cache[session_id]
    else:
        async with aiofiles.open(result_path) as f:
            data = await f.read()
        result = AnalysisResult.model_validate_json(data)

    if format == "markdown":
        content = to_markdown(result)
        return Response(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="boardiq-{session_id}.md"'},
        )
    elif format == "json":
        content = to_json(result)
        return Response(
            content=content,
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="boardiq-{session_id}.json"'},
        )
    elif format == "mermaid":
        content = to_mermaid(result)
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="boardiq-{session_id}.mmd"'},
        )
    else:
        raise HTTPException(400, f"Unsupported format: {format}. Use: json, markdown, mermaid")

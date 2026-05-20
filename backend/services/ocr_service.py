import httpx
import base64
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class OCRService:
    """Google Cloud Vision OCR service with Arabic + English support."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.endpoint = "https://vision.googleapis.com/v1/images:annotate"

    async def extract_text(self, image_bytes: bytes) -> str:
        """Extract text from image using Google Vision API."""
        if not self.api_key:
            logger.warning("No OCR API key configured, skipping OCR")
            return ""

        try:
            image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
            payload = {
                "requests": [
                    {
                        "image": {"content": image_b64},
                        "features": [
                            {"type": "DOCUMENT_TEXT_DETECTION", "maxResults": 1}
                        ],
                        "imageContext": {
                            "languageHints": ["en", "ar", "en-t-i0-handwrit", "ar-t-i0-handwrit"]
                        },
                    }
                ]
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.endpoint}?key={self.api_key}",
                    json=payload,
                )
                response.raise_for_status()

            data = response.json()
            annotation = data.get("responses", [{}])[0].get("fullTextAnnotation", {})
            return annotation.get("text", "")

        except httpx.HTTPStatusError as e:
            logger.error(f"Google Vision API error: {e.response.status_code}")
            return ""
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""

    def detect_languages(self, text: str) -> list[str]:
        """Detect languages present in extracted text."""
        languages = []
        has_english = any(c.isascii() and c.isalpha() for c in text)
        has_arabic = any("؀" <= c <= "ۿ" for c in text)
        if has_english:
            languages.append("English")
        if has_arabic:
            languages.append("Arabic")
        return languages or ["Unknown"]

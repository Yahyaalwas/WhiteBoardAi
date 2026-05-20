import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import io
import base64
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


def preprocess_whiteboard(image_bytes: bytes) -> bytes:
    """
    Full whiteboard image preprocessing pipeline:
    1. Perspective correction / edge detection
    2. Noise removal
    3. Contrast enhancement
    4. Sharpening
    5. Background normalization
    """
    try:
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image")

        # Step 1: Resize if too large (keep aspect ratio)
        img = _resize_if_needed(img, max_dimension=2048)

        # Step 2: Detect and correct perspective
        img = _correct_perspective(img)

        # Step 3: Enhance contrast using CLAHE
        img = _enhance_contrast(img)

        # Step 4: Denoise
        img = _denoise(img)

        # Step 5: Sharpen text
        img = _sharpen(img)

        # Encode back to bytes
        _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 92])
        return bytes(buffer)

    except Exception as e:
        logger.warning(f"Preprocessing failed, using original: {e}")
        return image_bytes


def _resize_if_needed(img: np.ndarray, max_dimension: int = 2048) -> np.ndarray:
    h, w = img.shape[:2]
    if max(h, w) <= max_dimension:
        return img
    scale = max_dimension / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def _correct_perspective(img: np.ndarray) -> np.ndarray:
    """Attempt automatic perspective correction for whiteboard."""
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return img

        # Find largest quadrilateral contour
        largest = max(contours, key=cv2.contourArea)
        peri = cv2.arcLength(largest, True)
        approx = cv2.approxPolyDP(largest, 0.02 * peri, True)

        # Only correct if we found a clear quadrilateral taking up significant area
        img_area = img.shape[0] * img.shape[1]
        contour_area = cv2.contourArea(largest)

        if len(approx) == 4 and contour_area > img_area * 0.3:
            pts = approx.reshape(4, 2).astype(np.float32)
            pts = _order_points(pts)
            warped = _four_point_transform(img, pts)
            return warped

        return img
    except Exception:
        return img


def _order_points(pts: np.ndarray) -> np.ndarray:
    """Order points: top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype=np.float32)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


def _four_point_transform(img: np.ndarray, pts: np.ndarray) -> np.ndarray:
    """Apply perspective transform using 4 corner points."""
    (tl, tr, br, bl) = pts
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1],
    ], dtype=np.float32)
    M = cv2.getPerspectiveTransform(pts, dst)
    return cv2.warpPerspective(img, M, (maxWidth, maxHeight))


def _enhance_contrast(img: np.ndarray) -> np.ndarray:
    """Enhance contrast using CLAHE on the L channel."""
    try:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        l = clahe.apply(l)
        lab = cv2.merge((l, a, b))
        return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    except Exception:
        return img


def _denoise(img: np.ndarray) -> np.ndarray:
    """Remove noise while preserving text edges."""
    try:
        return cv2.fastNlMeansDenoisingColored(img, None, 6, 6, 7, 21)
    except Exception:
        return img


def _sharpen(img: np.ndarray) -> np.ndarray:
    """Sharpen text in the image."""
    try:
        kernel = np.array([
            [-0.5, -0.5, -0.5],
            [-0.5,  5.0, -0.5],
            [-0.5, -0.5, -0.5],
        ])
        sharpened = cv2.filter2D(img, -1, kernel)
        return cv2.addWeighted(img, 0.4, sharpened, 0.6, 0)
    except Exception:
        return img


def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.standard_b64encode(image_bytes).decode("utf-8")

# image_api.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import base64
import logging
import re
import json

from ai_provider import generate

router = APIRouter()  # ✅ NO prefix here
logger = logging.getLogger("image-api")

ALLOWED = {"Safe", "Scam", "Phishing", "Spam"}


def clamp(v):
    try:
        return max(0, min(100, int(v)))
    except Exception:
        return 0


def extract_json(text: str) -> dict:
    match = re.search(r"\{[\s\S]*?\}", text)
    if not match:
        raise ValueError("No JSON found in model output")
    return json.loads(match.group(0))


@router.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    """
    Image scam / phishing analysis endpoint
    Accepts multipart image upload
    """

    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image type")

    try:
        img_bytes = await image.read()
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")

        prompt = f"""
You are a cybersecurity AI.

Analyze the IMAGE CONTENT and any visible text.

Return ONLY valid JSON:

{{
  "verdict": "Safe | Scam | Phishing | Spam",
  "risk": 0-100,
  "spam": 0-100,
  "phish": 0-100,
  "explanation": "short reason"
}}

IMAGE (base64 preview):
{img_b64[:3000]}
"""

        raw = generate(prompt)
        data = extract_json(raw)

        verdict = data.get("verdict", "Scam")
        if verdict not in ALLOWED:
            verdict = "Scam"

        return {
            "verdict": verdict,
            "risk": clamp(data.get("risk")),
            "spam": clamp(data.get("spam")),
            "phish": clamp(data.get("phish")),
            "explanation": data.get(
                "explanation",
                "The image was analyzed for suspicious visual or textual patterns."
            )
        }

    except Exception:
        logger.exception("Image analysis failed")
        raise HTTPException(status_code=500, detail="Image analysis failed")

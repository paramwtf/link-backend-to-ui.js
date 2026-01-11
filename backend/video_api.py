from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re, json, logging
from ai_provider import generate

router = APIRouter()
logger = logging.getLogger("video-api")

MAX_TEXT = 3000
ALLOWED = {"Safe", "Scam", "Phishing", "Spam"}

class VideoAnalyzeRequest(BaseModel):
    text: str

def clamp(v):
    try: return max(0, min(100, int(v)))
    except: return 0

def extract_json(txt):
    m = re.search(r"\{[\s\S]*?\}", txt)
    if not m:
        raise ValueError("No JSON found")
    return json.loads(m.group(0))

@router.post("/video/analyze")
def analyze_video(req: VideoAnalyzeRequest):
    text = req.text.strip()[:MAX_TEXT]
    if len(text) < 10:
        raise HTTPException(400, "No valid text")

    prompt = f"""
Analyze the following VIDEO OCR TEXT.

Return ONLY valid JSON:

{{
  "verdict": "Safe | Scam | Phishing | Spam",
  "risk": 0-100,
  "spam": 0-100,
  "phish": 0-100,
  "explanation": "short reason"
}}

VIDEO OCR TEXT:
<<<
{text}
>>>
"""

    try:
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
            "explanation": data.get("explanation", "")
        }

    except Exception:
        logger.exception("Video analysis failed")
        raise HTTPException(500, "Video analysis failed")

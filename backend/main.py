from dotenv import load_dotenv
load_dotenv()

import logging
import time
import re
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from text_api import router as text_router
from image_api import router as image_router
from video_api import router as video_router

# --------------------------------------------------
# LOGGING
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("unified-backend")

# --------------------------------------------------
# APP
# --------------------------------------------------

app = FastAPI(
    title="Drishti Dynamics – Unified AI Analyzer",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# ROUTES
# --------------------------------------------------

app.include_router(text_router, prefix="/api")
app.include_router(image_router, prefix="/api")
app.include_router(video_router, prefix="/api")

# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "provider": os.getenv("AI_PROVIDER"),
        "model": os.getenv("GROQ_MODEL") or os.getenv("OLLAMA_MODEL")
    }


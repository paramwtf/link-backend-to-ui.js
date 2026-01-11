# ai_provider.py
import os
import logging
import requests
from dotenv import load_dotenv

# --------------------------------------------------
# ENV + LOGGING
# --------------------------------------------------

load_dotenv()

logger = logging.getLogger("ai-provider")
logger.setLevel(logging.INFO)

AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").lower()

# --------------------------------------------------
# GROQ (CLOUD)
# --------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# --------------------------------------------------
# OLLAMA (LOCAL)
# --------------------------------------------------

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")

# --------------------------------------------------
# CONSTANTS
# --------------------------------------------------

MAX_PROMPT_CHARS = 6000
MAX_TOKENS = 512

logger.info(f"🧠 AI PROVIDER: {AI_PROVIDER}")
logger.info(f"🧠 MODEL: {GROQ_MODEL if AI_PROVIDER == 'groq' else OLLAMA_MODEL}")

# --------------------------------------------------
# PUBLIC API
# --------------------------------------------------

def generate(prompt: str) -> str:
    """
    Unified text generation entry point.
    Switches between Groq (cloud) and Ollama (local).
    """

    if not prompt or not isinstance(prompt, str):
        raise ValueError("Prompt must be a non-empty string")

    # Safety trim
    prompt = prompt.strip()
    if len(prompt) > MAX_PROMPT_CHARS:
        prompt = prompt[:MAX_PROMPT_CHARS]

    if AI_PROVIDER == "groq":
        return _generate_groq(prompt)

    return _generate_ollama(prompt)

# --------------------------------------------------
# GROQ IMPLEMENTATION
# --------------------------------------------------

def _generate_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set")

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": MAX_TOKENS
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        r = requests.post(
            GROQ_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        if r.status_code != 200:
            logger.error(f"🔴 GROQ ERROR {r.status_code}: {r.text}")

        r.raise_for_status()

        data = r.json()
        return data["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as e:
        logger.exception("Groq request failed")
        raise RuntimeError(f"Groq API error: {str(e)}")

# --------------------------------------------------
# OLLAMA IMPLEMENTATION
# --------------------------------------------------

def _generate_ollama(prompt: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": MAX_TOKENS
        }
    }

    try:
        r = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=300
        )

        r.raise_for_status()
        return r.json().get("response", "")

    except requests.exceptions.RequestException as e:
        logger.exception("Ollama request failed")
        raise RuntimeError(f"Ollama error: {str(e)}")

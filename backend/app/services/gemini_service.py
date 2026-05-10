from google import genai
import os, asyncio
from loguru import logger
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")


class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY bulunamadı!")
            raise ValueError("GEMINI_API_KEY eksik.")

        self.client = genai.Client(api_key=api_key)
        logger.info("Model hazır: gemini-2.0-flash")

    async def generate_content(self, prompt: str) -> str:
        try:
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model="gemini-2.5-flash-lite",
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini Hatası: {str(e)}")
            raise e


gemini_service = GeminiService()

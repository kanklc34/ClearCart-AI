import os
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv
from loguru import logger

# .env dosyasının tam yolunu bul
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY bulunamadı!")
        
        genai.configure(api_key=api_key)
        
        # Senin listende çıkan en güncel modellere geçiyoruz
        self.flash_model_name = 'models/gemini-2.5-flash'
        self.pro_model_name = 'models/gemini-2.5-flash'
        
        self.flash_model = genai.GenerativeModel(self.flash_model_name)
        self.pro_model = genai.GenerativeModel(self.pro_model_name)
        
        logger.info(f"Modeller Hazır: {self.flash_model_name} & {self.pro_model_name}")

    async def generate_content(self, prompt: str, use_pro: bool = False):
        model = self.pro_model if use_pro else self.flash_model
        try:
            logger.info(f"Gemini API ({'2.5 Flash' if use_pro else '2.5 Flash'}) çağrılıyor...")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API Hatası: {str(e)}")
            raise e

gemini_service = GeminiService()

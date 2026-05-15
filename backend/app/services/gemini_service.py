from google import genai
import os, asyncio
from loguru import logger
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

# Model öncelik sırası: en iyi → en hızlı (sadece Gemini modelleri)
MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-3.0-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro",
]


class GeminiService:
    def __init__(self):
        # Tüm API key'leri topla
        self.api_keys: list[str] = []
        for i in range(1, 6):  # GEMINI_API_KEY, GEMINI_API_KEY_2 ... _5
            key = os.getenv("GEMINI_API_KEY" if i == 1 else f"GEMINI_API_KEY_{i}")
            if key:
                self.api_keys.append(key)

        if not self.api_keys:
            raise ValueError("Hiçbir GEMINI_API_KEY bulunamadı!")

        # Her key için client oluştur
        self.clients = [genai.Client(api_key=k) for k in self.api_keys]
        logger.info(
            f"GeminiService hazır: {len(self.clients)} API key, {len(MODELS)} model"
        )

    async def generate_content(self, prompt: str) -> str:
        last_error: Exception | None = None

        # Her modeli dene
        for model in MODELS:
            # Her API key'i dene
            for key_idx, client in enumerate(self.clients):
                try:
                    response = await asyncio.to_thread(
                        client.models.generate_content,
                        model=model,
                        contents=prompt,
                    )
                    logger.debug(f"Başarılı: model={model}, key={key_idx + 1}")
                    return response.text
                except Exception as e:
                    err_str = str(e).lower()
                    # Quota/rate limit → sonrakini dene
                    if any(
                        x in err_str
                        for x in ["quota", "rate", "429", "resource_exhausted"]
                    ):
                        logger.warning(
                            f"Quota aşıldı: model={model}, key={key_idx + 1} → sonraki deneniyor"
                        )
                        last_error = e
                        continue
                    # Model bulunamadı → model döngüsünde sonrakine geç
                    if any(x in err_str for x in ["not found", "404", "invalid model"]):
                        logger.warning(
                            f"Model bulunamadı: {model} → sonraki model deneniyor"
                        )
                        last_error = e
                        break  # Bu modelin diğer key'lerini denemeye gerek yok
                    # Diğer hatalar → yine dene
                    logger.warning(f"Hata: model={model}, key={key_idx + 1}: {e}")
                    last_error = e
                    continue

        logger.error(f"Tüm model/key kombinasyonları başarısız. Son hata: {last_error}")
        raise last_error or RuntimeError("Gemini servisi kullanılamıyor.")


gemini_service = GeminiService()

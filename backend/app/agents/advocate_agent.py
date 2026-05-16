from .base_agent import BaseAgent
import json
from loguru import logger


class AdvocateAgent(BaseAgent):
    """
    Ürünü SAVUNAN ajan.
    Ürünün güçlü yanlarını, olumlu göstergelerini ve satın almayı
    destekleyen argümanları üretir. Kasıtlı olarak iyimser bakar.
    """

    def __init__(self):
        super().__init__(name="Advocate")

    async def run(self, product_content: str, user_context: str) -> dict:
        prompt = f"""
        Sen bir tüketici hakları avukatısın ve MÜVEKKİLİNİ (alıcıyı) SAVUNUYORSUN.
        Görevin: Bu ürünü SATIN ALMANIN lehine olan TÜM argümanları bul.

        ZORUNLU KURALLAR:
        - Kesinlikle markdown kullanma: **, *, #, __, [] gibi karakterler yasak
        - Tüm metinler düz Türkçe cümle olacak
        - Sadece JSON döndür, başka hiçbir şey yazma

        Kullanıcı Profili: {user_context}
        Ürün/Sayfa İçeriği:
        {product_content[:3500]}

        Yanıtı SADECE şu JSON formatında ver:
        {{
            "verdict": "AL",
            "confidence": 0-100,
            "top_arguments": [
                "Güçlü argüman 1 (somut, sayfadan kanıtla)",
                "Güçlü argüman 2",
                "Güçlü argüman 3"
            ],
            "trust_signals": [
                "Güven veren sinyal 1",
                "Güven veren sinyal 2"
            ],
            "score_estimate": {{
                "legal": 0-100,
                "financial": 0-100,
                "trust": 0-100,
                "safety": 0-100
            }},
            "summary": "Tek cümlelik savunma argümanı"
        }}
        """

        response = await self.ask_gemini(prompt)
        try:
            clean = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            logger.error(f"Advocate parse hatası: {e}")
            return {
                "verdict": "AL",
                "confidence": 50,
                "top_arguments": ["Yeterli veri çekilemedi."],
                "trust_signals": [],
                "score_estimate": {
                    "legal": 50,
                    "financial": 50,
                    "trust": 50,
                    "safety": 50,
                },
                "summary": "Analiz tamamlanamadı.",
            }

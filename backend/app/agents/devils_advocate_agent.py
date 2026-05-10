from .base_agent import BaseAgent
import json
from loguru import logger


class DevilsAdvocateAgent(BaseAgent):
    """
    Ürüne KARŞI çıkan ajan.
    Dark pattern'ları, gizli riskleri, şeffaflık eksiklerini ve
    pişmanlık senaryolarını arar. Kasıtlı olarak şüpheci bakar.
    """

    def __init__(self):
        super().__init__(name="DevilsAdvocate")

    async def run(
        self,
        product_content: str,
        user_context: str,
        advocate_arguments: list[str],
    ) -> dict:
        prompt = f"""
        Sen bir tüketici hakları savcısısın. Görevin bu ürünü satın almaya KARŞI argüman üretmek.
        Özellikle şu konulara odaklan: dark pattern'lar, gizli ücretler, iade zorlukları,
        yanıltıcı ifadeler, eksik bilgiler, garanti tuzakları.

        Kullanıcı Profili: {user_context}

        Rakip Avukatın Argümanları (bunlara itiraz et):
        {json.dumps(advocate_arguments, ensure_ascii=False)}

        Ürün/Sayfa İçeriği:
        {product_content[:3500]}

        Yanıtı SADECE şu JSON formatında ver:
        {{
            "verdict": "ALMA",
            "confidence": 0-100,
            "top_arguments": [
                "Risk argümanı 1 (somut, sayfadan kanıtla veya eksikliği göster)",
                "Risk argümanı 2",
                "Risk argümanı 3"
            ],
            "dark_patterns": [
                "Tespit edilen dark pattern veya şüpheli uygulama"
            ],
            "rebuttals": [
                "Avukatın X argümanına itiraz: çünkü..."
            ],
            "regret_scenarios": [
                "Satın alma sonrası pişmanlık senaryosu"
            ],
            "score_estimate": {{
                "legal": 0-100,
                "financial": 0-100,
                "trust": 0-100,
                "safety": 0-100
            }},
            "summary": "Tek cümlelik karşı argüman"
        }}
        """

        response = await self.ask_gemini(prompt)
        try:
            clean = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            logger.error(f"DevilsAdvocate parse hatası: {e}")
            return {
                "verdict": "ALMA",
                "confidence": 50,
                "top_arguments": ["Yeterli veri çekilemedi."],
                "dark_patterns": [],
                "rebuttals": [],
                "regret_scenarios": [],
                "score_estimate": {"legal": 50, "financial": 50, "trust": 50, "safety": 50},
                "summary": "Analiz tamamlanamadı.",
            }
from .base_agent import BaseAgent
import json
from loguru import logger
from urllib.parse import urlparse


class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Orchestrator")

    async def run(self, url: str) -> dict:
        domain = urlparse(url).netloc.lower()
        path = urlparse(url).path

        prompt = f"""
        Aşağıdaki URL'yi analiz et ve bir e-ticaret ÜRÜN SAYFASI olup olmadığını belirle.
        URL: {url}
        Domain: {domain}
        Path: {path}

        Yanıtı SADECE şu JSON formatında ver, başka hiçbir şey yazma:
        {{
            "is_product_page": true/false,
            "page_type": "product" | "homepage" | "search" | "category" | "invalid",
            "platform": "amazon" | "trendyol" | "hepsiburada" | "n11" | "other",
            "is_scam": true/false,
            "scam_reason": "Varsa neden sahte/zararlı olduğunu açıkla, yoksa null",
            "error_message": "Ürün sayfası değilse kullanıcıya nazik uyarı, yoksa null"
        }}
        """

        response = await self.ask_gemini(prompt)
        try:
            clean = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean)
            return data
        except Exception as e:
            logger.error(f"Orchestrator parse hatası: {e}")
            return {
                "is_product_page": False,
                "page_type": "invalid",
                "is_scam": False,
                "error_message": "Bağlantı analiz edilemedi. Lütfen geçerli bir ürün linki paylaşın.",
            }
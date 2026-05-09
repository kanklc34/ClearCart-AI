from .base_agent import BaseAgent
import json
from loguru import logger
from urllib.parse import urlparse

class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Orchestrator", model_type="flash")

    async def run(self, url: str):
        domain = urlparse(url).netloc.lower()
        path = urlparse(url).path
        
        # Eğer path boşsa veya sadece / ise ana sayfadır
        is_homepage = path == "" or path == "/"
        
        prompt = f"""
        Aşağıdaki URL'yi analiz et ve bir e-ticaret ÜRÜN SAYFASI olup olmadığını belirle.
        URL: {url}
        Domain: {domain}
        Path: {path}
        
        Yanıtı sadece şu JSON formatında ver:
        {{
            "is_product_page": boolean,
            "page_type": "product" | "homepage" | "search" | "invalid",
            "platform": "amazon" | "trendyol" | "hepsiburada" | "other",
            "is_scam": boolean,
            "scam_reason": "Neden?",
            "error_message": "Eğer ürün sayfası değilse kullanıcıya verilecek nazik uyarı",
            "tasks": ["extract_policy", "analyze_risk"]
        }}
        """
        
        response = await self.ask_gemini(prompt)
        try:
            clean_response = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_response)
            
            # Eğer ana sayfaysa veya ürün sayfası değilse görevleri iptal et
            if not data.get("is_product_page") or data.get("is_scam"):
                data["tasks"] = []
                
            return data
        except Exception as e:
            logger.error(f"Orchestrator Hatası: {str(e)}")
            return {
                "is_product_page": False,
                "page_type": "invalid",
                "is_scam": False,
                "error_message": "Bağlantı analiz edilemedi. Lütfen geçerli bir ürün linki paylaşın."
            }

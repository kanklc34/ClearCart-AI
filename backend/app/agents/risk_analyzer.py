from .base_agent import BaseAgent
import json
from loguru import logger

class RiskAnalyzerAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="RiskAnalyzer", model_type="flash")

    async def run(self, content: str, user_context: str):
        prompt = f"""
        Sen 'ClearCart AI' Evrensel Tüketici Denetçisisin. 
        Görevin: Herhangi bir e-ticaret platformundan (Trendyol, Amazon, Hepsiburada, N11 vb.) bağımsız olarak, 
        ürünü ve satıcıyı 'ClearCart Evrensel Tüketici Hakları Standartı'na göre denetlemek.
        
        UNUTMA: Platformun kendi yıldız puanı (örn: 4.8 yıldız) yanıltıcı olabilir. Sen metnin arkasındaki gerçek riskleri bulmalısın.
        
        DENETİM KRİTERLERİN (Ortak Dil):
        1. YASAL UYUMLULUK (Legal Compliance): 6502 sayılı Tüketici Kanunu ve evrensel haklara uyum.
        2. FİNANSAL DÜRÜSTLÜK (Financial Integrity): Gizli vade farkları, 'indirim' süsü verilmiş fiyat oyunları.
        3. OPERASYONEL ŞEFFAFLIK (Transparency): İade adresinin netliği, kargo süreçlerindeki belirsizlikler.
        4. SATICI KARAKTERİ (Seller Audit): Garanti belgeleri, yetkili servis beyanları.

        Kullanıcı Bağlamı: {user_context}

        Yanıtı sadece şu JSON formatında ver:
        {{
            "overall_score": 0-100 (ClearCart Standart Puanı),
            "advocate_advice": "Evrensel denetim sonucu çıkan keskin tavsiye",
            "categories": {{
                "legal": {{ "score": 0-100, "details": "Yasal hak analizi", "status": "good" | "warning" | "danger" }},
                "financial": {{ "score": 0-100, "details": "Maliyet dürüstlüğü", "status": "good" | "warning" | "danger" }},
                "transparency": {{ "score": 0-100, "details": "Şeffaflık analizi", "status": "good" | "warning" | "danger" }},
                "safety": {{ "score": 0-100, "details": "Ürün/Garanti güvenliği", "status": "good" | "warning" | "danger" }}
            }},
            "platform_audit": "Platformun (Trendyol vb.) sunduğu bilgiler ile senin bulduğun gerçekler arasındaki fark"
        }}
        """
        
        response = await self.ask_gemini(prompt)
        try:
            clean_response = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_response)
        except Exception as e:
            logger.error(f"RiskAnalyzer JSON Parse Hatası: {str(e)}")
            return {{ "overall_score": 50, "advocate_advice": "Denetim tamamlanamadı" }}

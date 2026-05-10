from .base_agent import BaseAgent
import json
from loguru import logger

class RiskAnalyzerAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="RiskAnalyzer", model_type="flash")

    async def run(self, content: str, user_context: str):
        is_blocked = "ERROR_PLATFORM_BLOCKED" in content
        
        prompt = f"""
        Sen 'ClearCart AI' Baş Denetçisisin. 
        Durum: {'DİKKAT! Platform veriye erişimi engelledi. Bu bir ŞEFFAFLIK İHLALİDİR.' if is_blocked else 'Veri başarıyla çekildi.'}
        
        Gereksiz konuşma, sert ve net ol.
        Kullanıcı Bağlamı: {user_context}
        Ürün Verisi (Ham): {content[:4000]}

        GÖREVLERİN:
        1. Eğer engellenme varsa, 'Şeffaflık' (Transparency) skorunu 10'un altına düşür.
        2. 'Platform Audit Insight' kısmında platformun denetimi engellediğini açıkça belirt.
        3. Pişmanlık tahmini yaparken bu bilgi eksikliğini büyük bir risk olarak ekle.
        
        Yanıtı sadece şu JSON formatında ver:
        {{
            "overall_score": 0-100,
            "trust_adjusted_score": 0.0-5.0,
            "platform_rating": 0.0-5.0,
            "verdict": "DİKKAT" | "ALMA" | "AL",
            "advocate_advice": "Kısa karar cümlesi",
            "regret_forecast": {{
                "probability": "%0-100",
                "reason": "Neden?"
            }},
            "critical_bullets": ["Mermi gibi kısa tespitler"],
            "debate_summary": "Ajanların çatıştığı ana nokta",
            "categories": {{
                "legal": {{ "score": 0-100, "status": "good" | "warning" | "danger" }},
                "financial": {{ "score": 0-100, "status": "good" | "warning" | "danger" }},
                "trust": {{ "score": 0-100, "status": "good" | "warning" | "danger" }},
                "safety": {{ "score": 0-100, "status": "good" | "warning" | "danger" }}
            }},
            "platform_audit": "Platformun denetimi engellemesi hakkındaki sert yorumun"
        }}
        """
        
        response = await self.ask_gemini(prompt)
        try:
            clean_response = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_response)
        except Exception as e:
            logger.error(f"RiskAnalyzer Parse Hatası: {str(e)}")
            return {{ "overall_score": 0, "verdict": "ALMA", "advocate_advice": "Denetim engellendi!" }}

from .base_agent import BaseAgent
import json
from loguru import logger


class JudgeAgent(BaseAgent):
    """
    Hakem ajan.
    Advocate ve Devil's Advocate'in argümanlarını tartarak
    tarafsız final karar ve skor gerekçesi üretir.
    """

    def __init__(self):
        super().__init__(name="Judge")

    async def run(
        self,
        product_content: str,
        user_context: str,
        advocate_result: dict,
        devils_result: dict,
    ) -> dict:

        is_blocked = "ERROR_PLATFORM_BLOCKED" in product_content

        prompt = f"""
        Sen bağımsız bir tüketici hakları hakemisin. İki tarafı dinledin:

        == SAVUNMA (Advocate) ==
        Karar: {advocate_result.get("verdict")} (Güven: {advocate_result.get("confidence")}%)
        Argümanlar: {json.dumps(advocate_result.get("top_arguments", []), ensure_ascii=False)}
        Güven Sinyalleri: {json.dumps(advocate_result.get("trust_signals", []), ensure_ascii=False)}
        Özet: {advocate_result.get("summary")}

        == İTİRAZ (Devil's Advocate) ==
        Karar: {devils_result.get("verdict")} (Güven: {devils_result.get("confidence")}%)
        Riskler: {json.dumps(devils_result.get("top_arguments", []), ensure_ascii=False)}
        Dark Pattern'lar: {json.dumps(devils_result.get("dark_patterns", []), ensure_ascii=False)}
        Pişmanlık Senaryoları: {json.dumps(devils_result.get("regret_scenarios", []), ensure_ascii=False)}
        Özet: {devils_result.get("summary")}

        {"⚠️ UYARI: Platform veri erişimini engelledi — şeffaflık ihlali. Bu skoru aşağı çek." if is_blocked else ""}

        Kullanıcı Profili: {user_context}
        Ürün İçeriği (ek referans): {product_content[:2000]}

        Görevin:
        1. Hangi tarafın argümanları daha güçlü kanıta dayanıyor?
        2. Çarpışma noktalarını belirle
        3. Tarafsız final karar ver
        4. "score_breakdown" alanında skoru etkileyen 3-4 somut faktörü belirt:
           - Her faktör için kısa isim, +/- etkisi ve bir cümle açıklama yaz
           - Bu kullanıcının "neden bu skor?" sorusunu cevaplamalı

        Yanıtı SADECE şu JSON formatında ver:
        {{
            "overall_score": 0-100,
            "trust_adjusted_score": 0.0-5.0,
            "verdict": "AL" | "DİKKAT" | "ALMA",
            "advocate_advice": "Kullanıcıya yönelik net karar cümlesi",
            "debate_winner": "advocate" | "devils_advocate" | "tie",
            "debate_clash_points": [
                "İki tarafın çeliştiği kritik nokta 1",
                "İki tarafın çeliştiği kritik nokta 2"
            ],
            "debate_summary": "Tartışmanın özeti — hangi argüman daha güçlüydü ve neden",
            "score_breakdown": [
                {{
                    "factor": "Kısa faktör adı",
                    "impact": "+10" | "-15" (artı veya eksi puan etkisi),
                    "explanation": "Neden bu etkiyi yaptı — 1 cümle"
                }}
            ],
            "critical_bullets": [
                "Kullanıcının bilmesi gereken en kritik 3-5 madde"
            ],
            "regret_forecast": {{
                "probability": "%0-100",
                "reason": "Pişmanlık olasılığının ana nedeni"
            }},
            "categories": {{
                "legal": {{ "score": 0-100, "status": "good" | "warning" | "danger", "note": "Kısa açıklama" }},
                "financial": {{ "score": 0-100, "status": "good" | "warning" | "danger", "note": "Kısa açıklama" }},
                "trust": {{ "score": 0-100, "status": "good" | "warning" | "danger", "note": "Kısa açıklama" }},
                "safety": {{ "score": 0-100, "status": "good" | "warning" | "danger", "note": "Kısa açıklama" }}
            }},
            "platform_audit": "Platformun şeffaflık davranışı hakkında yorum"
        }}
        """

        response = await self.ask_gemini(prompt)
        try:
            clean = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except Exception as e:
            logger.error(f"Judge parse hatası: {e}")
            return {
                "overall_score": 0,
                "verdict": "DİKKAT",
                "advocate_advice": "Analiz tamamlanamadı, dikkatli olun.",
                "debate_summary": "Hakem analizi başarısız oldu.",
                "score_breakdown": [],
                "critical_bullets": ["Sistem hatası oluştu."],
            }

import json
from loguru import logger
from .gemini_service import gemini_service

class ReasoningService:
    """Uses Gemini to generate high-level technical rationales and executive summaries."""

    async def generate_rationales(self, audit_data: dict, product_text: str) -> dict:
        """Generates structured rationales based on agent findings and product text."""
        
        prompt = f"""
        Act as a professional Marketplace Security Auditor. 
        You are part of the 'ClearCart AI' system, a probabilistic trust engine for marketplace listings.
        
        INPUT DATA:
        - Overall Trust Score: {audit_data.get('overall_score')} / 100
        - Probabilistic Confidence: {audit_data.get('probabilistic_confidence', 0.5) * 100:.1f}%
        - Recommendation: {audit_data.get('recommendation')}
        - Key Findings: {audit_data.get('key_findings')}
        - Category: {audit_data.get('category_grounding', {}).get('category_label')}
        - Category Ambiguity: {audit_data.get('category_grounding', {}).get('ambiguity_score', 0.0) * 100:.1f}%
        - Product Text Snippet: {product_text[:2500]}
        
        TASK:
        Generate a technical but human-readable analysis of this listing. 
        Focus on 'Epistemic Risk' — distinguish between 'known anomalies' and 'uncertainty due to missing data'.
        Mention how the Category Ambiguity affects the audit's reliability if it's high (>40%).
        
        OUTPUT FORMAT (Strict JSON):
        {{
            "executive_summary": "Denetimin 2-3 cümlelik profesyonel özeti (Türkçe).",
            "strongest_signals": [
                {{ "label": "Sinyalin kısa adı (Türkçe)", "confidence": 0.0-1.0 }},
                {{ "label": "Sinyalin kısa adı (Türkçe)", "confidence": 0.0-1.0 }},
                {{ "label": "Sinyalin kısa adı (Türkçe)", "confidence": 0.0-1.0 }}
            ],
            "uncertainty_drivers": [
                "Belirsizlik Etkeni 1 (örn: kısmi metin görünürlüğü) (Türkçe)",
                "Belirsizlik Etkeni 2 (Türkçe)"
            ],
            "anomalies": [
                "Anomali 1 (örn: fiyat kategori tabanıyla uyumsuz) (Türkçe)",
                "Anomali 2 (Türkçe)"
            ],
            "counter_inference": "Kırmızı bayraklara rağmen orijinalliği destekleyen bir sinyal varsa kısaca belirt (yoksa boş bırak) (Türkçe)."
        }}
        
        Ensure the JSON is valid and only return the JSON block.
        """
        
        try:
            response_text = await gemini_service.generate_content(prompt)
            # Clean response text if LLM adds markdown blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
                
            reasoning = json.loads(response_text)
            return reasoning
        except Exception as e:
            logger.error(f"Reasoning generation failed: {e}")
            # Fallback to empty structure
            return {
                "executive_summary": "Teknik denetim tamamlandı. Ayrıntılar için modül sinyallerine bakın.",
                "strongest_signals": [],
                "uncertainty_drivers": ["Genel epistemik varyans"],
                "anomalies": [],
                "counter_inference": "Belirlenmedi."
            }

reasoning_service = ReasoningService()

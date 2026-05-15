import asyncio
import json

class DemoService:
    async def get_demo_audit(self, url: str) -> dict:
        """Returns a high-quality mock audit for demo purposes."""
        
        # Mock product text
        product_text = """
        Dyson V15 Detect Cordless Vacuum Cleaner - Yellow/Nickel
        Price: 24,999 TL
        Special Offer: Only 2 left in stock! Order within 5 minutes for free shipping!
        - Intelligent suction power adjustment
        - Piezo sensor tracks particles
        - HEPA filtration
        - 60 minutes run time
        """
        
        # Mock audit result
        audit = {
            "overall_score": 88,
            "recommendation": "SAFE",
            "score_breakdown": {
                "data_integrity": 95,
                "market_plausibility": 92,
                "behavioral_pressure_risk": 75,
                "listing_completeness": 90
            },
            "key_findings": [
                "Strong technical specification consistency.",
                "Pricing aligns with authorized reseller baselines.",
                "Urgency markers detected (scarcity framing) but within nominal limits.",
                "Verified manufacturer warranty documentation present."
            ],
            "confidence_note": {
                "level": "HIGH_TRUST",
                "reason": "Multi-agent consensus achieved with low variance and high evidence density."
            },
            "evidence_log": [
                {"type": "VERIFICATION", "dimension": "DATA_INTEGRITY", "message": "HEPA filtration specs cross-verified with model database.", "impact": 15},
                {"type": "MARKET_CHECK", "dimension": "PRICE_VAL", "message": "Price is 4% above category floor (Safe Zone).", "impact": 10},
                {"type": "RISK_SIGNAL", "dimension": "PRESSURE", "message": "Artificial scarcity detected ('Only 2 left').", "impact": -5},
                {"type": "VERIFICATION", "dimension": "WARRANTY", "message": "Manufacturer 2-year warranty verified.", "impact": 12}
            ],
            "consensus_factors": {
                "coverage": 0.94,
                "evidence_density": 0.88,
                "uncertainty": 0.12,
                "correlation_risk": 0.05
            },
            "reasoning": {
                "executive_summary": "This Dyson V15 listing shows extremely high reliability markers. All technical specifications are consistent with official documentation and the pricing is within the expected market range for authorized distribution.",
                "strongest_signals": [
                    {"label": "Spec Consistency", "confidence": 0.98},
                    {"label": "Market Pricing", "confidence": 0.94},
                    {"label": "Warranty Verified", "confidence": 0.90}
                ],
                "uncertainty_drivers": [
                    "Dynamic pricing algorithm detected",
                    "Minor scarcity pressure observed"
                ],
                "anomalies": [
                    "High-pressure inventory countdown detected"
                ],
                "counter_inference": "Despite minor psychological pressure, the core technical data and pricing structure are highly consistent with an authentic listing."
            }
        }
        
        extraction_meta = {
            "structured_data_found": True,
            "text_length": len(product_text),
            "html_length": 45000,
            "is_blocked": False,
            "platform": "trendyol",
            "grounding_trace": {
                "breadcrumb_category": "Elektronik > Süpürge",
                "schema_org_category": "Product > Vacuum",
                "canonical_url_taxonomy": "vacuum-cleaner",
                "attribute_derived_category": "Vertical Vacuum"
            },
            "grounding_explanation": "Platform-provided breadcrumbs and schema.org metadata provided high-confidence category anchoring."
        }
        
        return {
            "audit": audit,
            "extraction_meta": extraction_meta,
            "content": product_text
        }

    async def stream_demo(self, url: str):
        """Simulates a professional audit stream for demo purposes."""
        from ..api.analysis import sse, sse_final
        
        demo_data = await self.get_demo_audit(url)
        
        yield sse("URL Check", "URL format accepted. Platform scope: trendyol.")
        await asyncio.sleep(0.5)
        yield sse("Data Capture", "Collecting visible listing text from the product page.")
        await asyncio.sleep(0.8)
        yield sse("Data Capture", "Listing text collected successfully.")
        
        yield sse("Integrity Checker", "Measuring visible specifications for unit sanity and field consistency.")
        await asyncio.sleep(1.0)
        yield sse("Integrity Checker", "Specs verified against category schema.")
        
        yield sse("Market Validator", "Category grounded: Vacuum Cleaner (confidence: 0.98).")
        await asyncio.sleep(1.2)
        yield sse("Market Validator", "Comparing extracted price (24,999 TL) against structural baselines.")
        
        yield sse("Pressure Signal Detector", "Analyzing urgency wording and scarcity framing.")
        await asyncio.sleep(1.0)
        yield sse("Pressure Signal Detector", "Scarcity signal detected: 'Only 2 left'.")
        
        yield sse("Listing Auditor", "Verifying warranty, return policies and shipping terms.")
        await asyncio.sleep(0.8)
        
        yield sse("Consensus Scorer", "Synthesizing technical rationales using Gemini AI reasoning.")
        await asyncio.sleep(1.5)
        
        yield sse("Consensus Scorer", "Preparing the final audit summary.", {
            "audit_preview": {
                "overall_score": demo_data["audit"]["overall_score"],
                "recommendation": demo_data["audit"]["recommendation"]
            }
        })
        
        yield sse_final({
            "audit": demo_data["audit"],
            "extraction_meta": demo_data["extraction_meta"]
        })

demo_service = DemoService()

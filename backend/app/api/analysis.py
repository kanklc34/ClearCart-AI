from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..agents.orchestrator import OrchestratorAgent
from ..agents.advocate_agent import AdvocateAgent
from ..agents.devils_advocate_agent import DevilsAdvocateAgent
from ..agents.judge_agent import JudgeAgent
from ..services.scraper_service import scraper_service
from loguru import logger
import json
import asyncio

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class AnalysisRequest(BaseModel):
    url: str
    user_preferences: str = "general"


def sse(agent: str, thought: str, data: dict = None) -> str:
    payload = {"agent": agent, "thought": thought}
    if data:
        payload["data"] = data
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def sse_error(message: str) -> str:
    return f"data: {json.dumps({'error': message}, ensure_ascii=False)}\n\n"


def sse_final(result: dict) -> str:
    return (
        f"data: {json.dumps({'final': True, 'result': result}, ensure_ascii=False)}\n\n"
    )


def _verdict_to_recommendation(verdict: str) -> str:
    """AL/DİKKAT/ALMA → SAFE/VERIFY/AVOID"""
    return {"AL": "SAFE", "DİKKAT": "VERIFY", "ALMA": "AVOID"}.get(verdict, "VERIFY")


def _build_frontend_result(
    platform: str,
    is_blocked: bool,
    advocate: dict,
    devils: dict,
    judge: dict,
) -> dict:
    """
    Backend çıktısını frontend'in beklediği formata dönüştürür.
    Agent'lara dokunulmaz, sadece veri reshape edilir.
    """

    verdict = judge.get("verdict", "DİKKAT")
    overall_score = judge.get("overall_score", 50)
    categories = judge.get("categories", {})

    # ── Recommendation ──────────────────────────────────────────────────────
    recommendation = _verdict_to_recommendation(verdict)

    # ── Score Breakdown → Evidence Log ──────────────────────────────────────
    evidence_log = []
    for item in judge.get("score_breakdown", []):
        try:
            impact_str = str(item.get("impact", "0")).replace("+", "")
            impact = float(impact_str)
        except ValueError:
            impact = 0.0
        evidence_log.append(
            {
                "type": "positive" if impact >= 0 else "negative",
                "dimension": item.get("factor", ""),
                "message": item.get("explanation", ""),
                "impact": round(impact),
            }
        )

    # Advocate argümanlarını da evidence_log'a ekle (pozitif)
    for arg in advocate.get("top_arguments", [])[:3]:
        evidence_log.append(
            {
                "type": "positive",
                "dimension": "ADVOCATE",
                "message": arg,
                "impact": 5,
            }
        )

    # Devils argümanlarını da ekle (negatif)
    for arg in devils.get("top_arguments", [])[:3]:
        evidence_log.append(
            {
                "type": "negative",
                "dimension": "DEVIL_ADV",
                "message": arg,
                "impact": -5,
            }
        )

    # ── Module Signal List (4 modül) ─────────────────────────────────────────
    # Kategori skorlarını modüllere map et
    cat_legal = categories.get("legal", {})
    cat_financial = categories.get("financial", {})
    cat_trust = categories.get("trust", {})
    cat_safety = categories.get("safety", {})

    # Advocate güven sinyalleri + devils dark patterns → findings
    trust_findings = [f"✓ {s}" for s in advocate.get("trust_signals", [])[:2]] + [
        f"⚠ {d}" for d in devils.get("dark_patterns", [])[:2]
    ]
    integrity_findings = [
        item.get("explanation", "")
        for item in judge.get("score_breakdown", [])
        if str(item.get("impact", "0")).startswith("-")
    ][:3] or ["Veri tutarlılığı analiz edildi."]

    module_signal_list = [
        {
            "id": "integrity_checker",
            "label": "Data Integrity",
            "dimension": "integrity",
            "score": cat_legal.get("score", overall_score),
            "findings": integrity_findings,
            "confidence": advocate.get("confidence", 70) / 100,
            "evidence_density": min(1.0, len(evidence_log) / 10),
            "uncertainty": 0.3 if is_blocked else 0.15,
        },
        {
            "id": "market_validator",
            "label": "Market Plausibility",
            "dimension": "market",
            "score": cat_financial.get("score", overall_score),
            "findings": [
                f.get("explanation", "")
                for f in judge.get("score_breakdown", [])
                if "fiyat" in f.get("factor", "").lower()
                or "market" in f.get("factor", "").lower()
            ][:3]
            or advocate.get("top_arguments", [])[:2],
            "confidence": 0.75,
            "evidence_density": 0.6,
            "uncertainty": 0.2,
        },
        {
            "id": "pressure_signal_detector",
            "label": "Behavioral Pressure",
            "dimension": "pressure",
            "score": cat_trust.get("score", overall_score),
            "findings": [f"⚠ {d}" for d in devils.get("dark_patterns", [])[:3]],
            "confidence": devils.get("confidence", 70) / 100,
            "evidence_density": min(1.0, len(devils.get("dark_patterns", [])) / 5),
            "uncertainty": 0.25,
        },
        {
            "id": "listing_auditor",
            "label": "Listing Quality",
            "dimension": "listing",
            "score": cat_safety.get("score", overall_score),
            "findings": judge.get("critical_bullets", [])[:3],
            "confidence": 0.65,
            "evidence_density": 0.5,
            "uncertainty": 0.3,
        },
    ]

    # ── Consensus Factors ────────────────────────────────────────────────────
    avg_uncertainty = 0.35 if is_blocked else 0.2
    consensus_factors = {
        "coverage": min(1.0, len(evidence_log) / 12),
        "evidence_density": min(
            1.0,
            (
                len(advocate.get("top_arguments", []))
                + len(devils.get("top_arguments", []))
            )
            / 10,
        ),
        "uncertainty": avg_uncertainty,
        "correlation_risk": 0.4 if is_blocked else 0.15,
    }

    # ── Reasoning ────────────────────────────────────────────────────────────
    reasoning = {
        "executive_summary": judge.get("advocate_advice", ""),
        "strongest_signals": [
            {"label": s, "confidence": 0.85}
            for s in advocate.get("trust_signals", [])[:2]
        ]
        + [
            {"label": d, "confidence": 0.80}
            for d in devils.get("dark_patterns", [])[:1]
        ],
        "uncertainty_drivers": (
            ["Platform veri erişimini engelledi"] if is_blocked else []
        )
        + [judge.get("debate_summary", "")][:1],
        "anomalies": [f"⚠ {d}" for d in devils.get("dark_patterns", [])[:3]]
        + (judge.get("debate_clash_points") or [])[:2],
        "counter_inference": judge.get("debate_summary", ""),
    }

    # ── Extraction Meta ──────────────────────────────────────────────────────
    extraction_meta = {
        "structured_data_found": not is_blocked,
        "text_length": 0,
        "html_length": 0,
        "is_blocked": is_blocked,
        "platform": platform,
        "grounding_trace": {
            "advocate_confidence": f"{advocate.get('confidence', 0)}%",
            "devils_confidence": f"{devils.get('confidence', 0)}%",
            "debate_winner": judge.get("debate_winner", "tie"),
            "score_breakdown_items": len(judge.get("score_breakdown", [])),
        },
        "grounding_explanation": judge.get("debate_summary", "Analiz tamamlandı."),
    }

    return {
        "audit": {
            "overall_score": overall_score,
            "recommendation": recommendation,
            "score_breakdown": judge.get("score_breakdown", []),
            "key_findings": judge.get("critical_bullets", []),
            "confidence_note": {
                "level": "LOW" if is_blocked else "NOMINAL",
                "reason": "Platform erişim engeli" if is_blocked else "Normal analiz",
            },
            "evidence_log": evidence_log,
            "module_signal_list": module_signal_list,
            "consensus_factors": consensus_factors,
            "reasoning": reasoning,
            # Ham veriler de saklanıyor (RAW_DUMP sekmesi için)
            "_raw": {
                "advocate": advocate,
                "devils_advocate": devils,
                "judge": judge,
                "platform": platform,
                "is_blocked": is_blocked,
            },
        },
        "extraction_meta": extraction_meta,
    }


@router.post("/scan")
async def scan_product(request: AnalysisRequest):
    async def event_generator():
        try:
            # ── ADIM 1: URL Doğrulama ──────────────────────────────────────
            yield sse("Orchestrator", "URL yapısı ve platform doğrulanıyor...")

            orchestrator = OrchestratorAgent()
            strategy = await orchestrator.run(request.url)

            if not strategy.get("is_product_page") or strategy.get("is_scam"):
                error = (
                    strategy.get("error_message")
                    or strategy.get("scam_reason")
                    or "Bu sayfa analize uygun değil."
                )
                yield sse_error(error)
                return

            platform = strategy.get("platform", "Bilinmeyen")
            yield sse(
                "Orchestrator",
                f"✓ {platform.upper()} ürün sayfası doğrulandı. Denetim başlıyor.",
            )
            await asyncio.sleep(0.3)

            # ── ADIM 2: Scraping ───────────────────────────────────────────
            yield sse("Scraper", "Sayfa içeriği ve politikalar ayıklanıyor...")

            content = await scraper_service.scrape_url(request.url)

            if not content:
                yield sse_error(
                    "Sayfa içeriğine erişilemedi. Lütfen linki kontrol edin."
                )
                return

            is_blocked = "ERROR_PLATFORM_BLOCKED" in content
            if is_blocked:
                yield sse(
                    "Scraper",
                    "⚠️ Platform veri erişimini engelledi — şeffaflık ihlali olarak kayıt altına alındı.",
                )
            else:
                yield sse("Scraper", "✓ Ürün verisi başarıyla çekildi.")
            await asyncio.sleep(0.3)

            # ── ADIM 3+4: Advocate ve DevilsAdvocate paralel ──────────────
            yield sse(
                "Advocate", "Savunma ve itiraz argümanları paralel hazırlanıyor..."
            )

            advocate = AdvocateAgent()
            devils = DevilsAdvocateAgent()

            advocate_result, devils_result = await asyncio.gather(
                advocate.run(content, request.user_preferences),
                devils.run(content, request.user_preferences, []),
            )

            yield sse(
                "Advocate",
                f"✓ Savunma tamamlandı: \"{advocate_result.get('summary', '')}\"",
                {"advocate": advocate_result},
            )
            yield sse(
                "DevilsAdvocate",
                f"✓ İtiraz tamamlandı: \"{devils_result.get('summary', '')}\"",
                {"devils_advocate": devils_result},
            )
            await asyncio.sleep(0.3)

            # ── ADIM 5: Judge ──────────────────────────────────────────────
            yield sse(
                "Judge",
                "Hakem devrede: argümanlar tartılıyor, final karar hazırlanıyor...",
            )

            judge = JudgeAgent()
            final = await judge.run(
                content, request.user_preferences, advocate_result, devils_result
            )

            yield sse(
                "Judge", f"✓ Denetim tamamlandı. Karar: {final.get('verdict', '?')}"
            )
            await asyncio.sleep(0.2)

            # ── FINAL: Veriyi frontend formatına dönüştür ──────────────────
            frontend_result = _build_frontend_result(
                platform=platform,
                is_blocked=is_blocked,
                advocate=advocate_result,
                devils=devils_result,
                judge=final,
            )

            yield sse_final(frontend_result)

        except Exception as e:
            logger.error(f"Stream hatası: {e}")
            yield sse_error("Sistemde geçici bir hata oluştu. Lütfen tekrar deneyin.")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

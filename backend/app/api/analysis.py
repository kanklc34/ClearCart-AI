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


@router.post("/scan")
async def scan_product(request: AnalysisRequest):
    async def event_generator():
        try:
            # ── ADIM 1: URL Doğrulama ──────────────────────────────────────────
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

            # ── ADIM 2: Scraping ───────────────────────────────────────────────
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

            # ── ADIM 3+4: Advocate ve DevilsAdvocate paralel ──────────────────
            yield sse("Advocate", "Savunma ve itiraz aynı anda hazırlanıyor...")

            advocate = AdvocateAgent()
            devils = DevilsAdvocateAgent()

            advocate_result, devils_result = await asyncio.gather(
                advocate.run(content, request.user_preferences),
                devils.run(content, request.user_preferences, []),
            )

            yield sse(
                "Advocate",
                f"✓ Savunma: \"{advocate_result.get('summary', '')}\"",
                {"advocate": advocate_result},
            )
            yield sse(
                "DevilsAdvocate",
                f"✓ İtiraz: \"{devils_result.get('summary', '')}\"",
                {"devils_advocate": devils_result},
            )
            await asyncio.sleep(0.3)

            # ── ADIM 5: Judge ──────────────────────────────────────────────────
            yield sse(
                "Judge",
                "Hakem devrede: iki tarafın argümanları tartılıyor, final karar hazırlanıyor...",
            )

            judge = JudgeAgent()
            final = await judge.run(
                content,
                request.user_preferences,
                advocate_result,
                devils_result,
            )

            yield sse(
                "Judge", f"✓ Denetim tamamlandı. Karar: {final.get('verdict', '?')}"
            )
            await asyncio.sleep(0.2)

            # ── FINAL SONUÇ ────────────────────────────────────────────────────
            yield sse_final(
                {
                    "platform": platform,
                    "is_blocked": is_blocked,
                    "advocate": advocate_result,
                    "devils_advocate": devils_result,
                    "judge": final,
                }
            )

        except Exception as e:
            logger.error(f"Stream hatası: {e}")
            yield sse_error("Sistemde geçici bir hata oluştu. Lütfen tekrar deneyin.")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..agents.orchestrator import OrchestratorAgent
from ..agents.risk_analyzer import RiskAnalyzerAgent
from ..services.scraper_service import scraper_service
from loguru import logger
import json
import asyncio

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

class AnalysisRequest(BaseModel):
    url: str
    user_preferences: str = "general"

@router.post("/scan")
async def scan_product(request: AnalysisRequest):
    async def event_generator():
        try:
            yield f"data: {json.dumps({'agent': 'SecurityCheck', 'thought': 'Sayfa yapısı ve güvenlik doğrulaması yapılıyor...'})}\n\n"
            orchestrator = OrchestratorAgent()
            strategy = await orchestrator.run(request.url)
            await asyncio.sleep(0.5)

            # EĞER ÜRÜN SAYFASI DEĞİLSE VEYA SCAM İSE
            if not strategy.get("is_product_page") or strategy.get("is_scam"):
                error_msg = strategy.get("error_message") or strategy.get("scam_reason") or "Bu sayfa analize uygun değil."
                yield f"data: {json.dumps({'error': error_msg, 'agent': 'SecurityCheck', 'thought': 'Analiz durduruldu.'})}\n\n"
                return

            yield f"data: {json.dumps({'agent': 'Orchestrator', 'thought': f'Platform {strategy.get(\"platform\")} ürün sayfası doğrulandı.'})}\n\n"
            
            # 2. Scraper
            yield f"data: {json.dumps({'agent': 'Scraper', 'thought': 'Ürün detayları ve politikalar ayıklanıyor...'})}\n\n"
            content = await scraper_service.scrape_url(request.url)
            
            if not content:
                yield f"data: {json.dumps({'error': 'Sayfa içeriğine erişilemedi. Lütfen linki kontrol edin.'})}\n\n"
                return

            # 3. Risk Analyzer
            yield f"data: {json.dumps({'agent': 'RiskAnalyzer', 'thought': 'Evrensel tüketici standartlarına göre denetim yapılıyor...'})}\n\n"
            analyzer = RiskAnalyzerAgent()
            analysis_result = await analyzer.run(content, request.user_preferences)
            
            final_data = {
                "is_scam": False,
                "analysis": analysis_result,
                "platform": strategy.get("platform"),
                "agent": "System",
                "thought": "Evrensel denetim raporu hazır."
            }
            yield f"data: {json.dumps(final_data)}\n\n"
            
        except Exception as e:
            logger.error(f"Stream Hatası: {str(e)}")
            yield f"data: {json.dumps({'error': 'Sistemde geçici bir hata oluştu. Lütfen tekrar deneyin.'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

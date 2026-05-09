import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys
from .api.analysis import router as analysis_router

# Loglama yapılandırması
logger.remove()
logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

app = FastAPI(
    title="ClearCart AI API",
    description="AI-powered shopping risk analysis engine",
    version="1.0.0"
)

# CORS ayarları - Frontend erişimi için daha kapsamlı yapılandırma
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Geliştirme için şimdilik "*" kalsın ama explicit liste eklendi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = "{0:.2f}".format(process_time)
        logger.info(f"RID: {request.scope.get('root_path')} | {request.method} {request.url.path} | Status: {response.status_code} | Time: {formatted_process_time}ms")
        return response
    except Exception as e:
        import traceback
        process_time = (time.time() - start_time) * 1000
        logger.error(f"HATA OLUŞTU: {str(e)}\n{traceback.format_exc()}")
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "traceback": traceback.format_exc()},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )

@app.get("/")
async def root():
    return {"message": "ClearCart AI API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

# Ajan Rotaları
app.include_router(analysis_router)

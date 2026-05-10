from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .api.analysis import router as analysis_router
import time
import sys
import asyncio
from loguru import logger

# Windows Playwright fix
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI(title="ClearCart AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    logger.info(f"{request.method} {request.url.path} | {response.status_code} | {ms:.0f}ms")
    return response


app.include_router(analysis_router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "ClearCart AI API v2.0"}
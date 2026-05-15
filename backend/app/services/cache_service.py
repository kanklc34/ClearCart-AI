import json
import os
import hashlib
from pathlib import Path
from loguru import logger

class CacheService:
    def __init__(self):
        self.cache_dir = Path(__file__).resolve().parents[2] / "data" / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_hash(self, url: str) -> str:
        return hashlib.md5(url.encode()).hexdigest()

    def get(self, url: str) -> dict | None:
        hash_val = self._get_hash(url)
        cache_file = self.cache_dir / f"{hash_val}.json"
        
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    logger.info(f"Cache hit: {url}")
                    return json.load(f)
            except Exception as e:
                logger.error(f"Cache read error: {e}")
        return None

    def set(self, url: str, result: dict):
        hash_val = self._get_hash(url)
        cache_file = self.cache_dir / f"{hash_val}.json"
        
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
                logger.info(f"Cache saved: {url}")
        except Exception as e:
            logger.error(f"Cache write error: {e}")

cache_service = CacheService()

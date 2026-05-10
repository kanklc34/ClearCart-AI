from abc import ABC, abstractmethod
from ..services.gemini_service import gemini_service
from loguru import logger


class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        logger.info(f"{self.name} ajanı başlatıldı")

    @abstractmethod
    async def run(self, *args, **kwargs):
        pass

    async def ask_gemini(self, prompt: str) -> str:
        return await gemini_service.generate_content(prompt)
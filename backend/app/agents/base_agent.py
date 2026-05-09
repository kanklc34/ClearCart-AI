from abc import ABC, abstractmethod
from ..services.gemini_service import gemini_service
from loguru import logger

class BaseAgent(ABC):
    def __init__(self, name: str, model_type: str = "flash"):
        self.name = name
        self.use_pro = model_type == "pro"
        logger.info(f"{self.name} ajanı başlatıldı (Mod: {model_type})")

    @abstractmethod
    async def run(self, input_data: str):
        pass

    async def ask_gemini(self, prompt: str):
        return await gemini_service.generate_content(prompt, use_pro=self.use_pro)

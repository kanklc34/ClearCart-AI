import httpx
from bs4 import BeautifulSoup
from loguru import logger

class ScraperService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def scrape_url(self, url: str):
        try:
            logger.info(f"URL kazınıyor: {url}")
            async with httpx.AsyncClient(headers=self.headers, follow_redirects=True, timeout=10.0) as client:
                response = await client.get(url)
                
                if response.status_code != 200:
                    logger.warning(f"Kazıma başarısız (Kod: {response.status_code})")
                    return None
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Gereksiz etiketleri temizle
                for script in soup(["script", "style", "nav", "footer", "header"]):
                    script.decompose()
                
                # Metni temizle ve birleştir
                text = soup.get_text(separator=' ', strip=True)
                
                # Çok uzun metinleri Gemini token limitleri ve hız için sınırla
                return text[:8000] 
                
        except Exception as e:
            logger.error(f"Scraper Hatası: {str(e)}")
            return None

scraper_service = ScraperService()

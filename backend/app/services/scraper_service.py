from playwright.sync_api import sync_playwright
from loguru import logger
import time
import asyncio
import concurrent.futures
import random

class ScraperService:
    def __init__(self):
        self.browser_args = [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-infobars"
        ]

    def _sync_scrape(self, url: str) -> str:
        try:
            with sync_playwright() as p:
                # iPhone simülasyonu (Mobil siteler daha az bot korumalıdır)
                device = p.devices['iPhone 13']
                browser = p.chromium.launch(headless=True, args=self.browser_args)
                
                context = browser.new_context(
                    **device,
                    locale="tr-TR",
                    timezone_id="Europe/Istanbul"
                )
                
                page = context.new_page()
                
                logger.info(f"İnsan taklidi ile kazıma: {url}")
                
                # Sayfaya git
                response = page.goto(url, wait_until="domcontentloaded", timeout=40000)
                
                if not response:
                    browser.close()
                    return ""

                # BOT KORUMASINI AŞMAK İÇİN İNSAN HAREKETLERİ
                # 1. Rastgele bekleme
                time.sleep(random.uniform(1, 3))
                
                # 2. Sayfayı yavaşça aşağı kaydır (Lazy loading verileri için)
                page.mouse.wheel(0, 500)
                time.sleep(1)
                page.mouse.wheel(0, 500)
                
                if response.status == 403:
                    logger.warning("Hala engelleniyoruz, ama içerik çekmeyi deneyeceğiz.")
                
                # Sayfadaki saf metni al (Engellenmiş olsa bile bazı veriler gelebilir)
                text = page.inner_text("body")
                
                # Eğer çok kısa bir metin geldiyse gerçekten engellenmişizdir
                if len(text) < 500:
                    browser.close()
                    return "ERROR_PLATFORM_BLOCKED"

                browser.close()
                return text[:7000]
                
        except Exception as e:
            logger.error(f"Playwright insansı kazıma hatası: {str(e)}")
            return ""

    async def scrape_url(self, url: str) -> str:
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return await loop.run_in_executor(pool, self._sync_scrape, url)

scraper_service = ScraperService()

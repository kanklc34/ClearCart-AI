import httpx
import asyncio


async def test():
    async with httpx.AsyncClient() as client:
        # Test root
        resp = await client.get("http://localhost:8000/")
        print("Root:", resp.text)

        # Test analysis
        data = {"url": "https://example.com", "user_preferences": "general"}
        resp = await client.post("http://localhost:8000/api/analysis/scan", json=data)
        print("Analysis status:", resp.status_code)
        print("Analysis response:", resp.text[:500])  # First 500 chars


asyncio.run(test())

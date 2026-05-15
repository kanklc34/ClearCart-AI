import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json().get("status") == "ok"


def test_scan_endpoint_requires_url():
    response = client.post("/api/analysis/scan", json={})
    assert response.status_code == 422
    assert "url" in response.text

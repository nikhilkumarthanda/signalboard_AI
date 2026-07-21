from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_scenario_price_increases_arr():
    baseline = client.post("/api/v1/scenarios", json={"price": 0, "churn": 2.8, "hires": 6}).json()
    growth = client.post("/api/v1/scenarios", json={"price": 10, "churn": 2.8, "hires": 6}).json()
    assert growth["arr"] > baseline["arr"]


def test_anomaly_endpoint():
    response = client.post("/api/v1/anomalies", json=[10, 10, 11, 10, 120, 9, 10])
    assert response.status_code == 200
    assert 4 in response.json()["anomaly_indices"]

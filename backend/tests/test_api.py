from fastapi.testclient import TestClient
import hashlib
import hmac
import json
import time

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


def test_forecast_reports_holdout_metrics():
    response = client.post("/api/v1/forecasts", json={"values": [10, 11, 12, 13, 14, 15, 16, 17], "horizon": 3})
    assert response.status_code == 200
    result = response.json()
    assert result["method"] == "linear_trend_baseline"
    assert len(result["forecast"]) == 3
    assert result["metrics"]["mae"] == 0


def test_health_score_is_explainable():
    response = client.post("/api/v1/customer-health", json={"usage_change_pct": -30, "feature_adoption_pct": 35, "open_tickets": 4, "payment_failures": 1, "renewal_days": 20})
    assert response.status_code == 200
    result = response.json()
    assert result["score"] < 50
    assert len(result["drivers"]) >= 4


def test_stripe_sync_requires_server_secret(monkeypatch):
    monkeypatch.delenv("STRIPE_API_KEY", raising=False)
    response = client.post("/api/v1/integrations/stripe/sync")
    assert response.status_code == 503


def test_stripe_webhook_verifies_signature(monkeypatch):
    secret = "whsec_test"
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", secret)
    payload = json.dumps({"id": "evt_test", "type": "invoice.paid"}, separators=(",", ":")).encode()
    timestamp = str(int(time.time()))
    digest = hmac.new(secret.encode(), timestamp.encode() + b"." + payload, hashlib.sha256).hexdigest()
    response = client.post("/api/v1/webhooks/stripe", content=payload, headers={"stripe-signature": f"t={timestamp},v1={digest}"})
    assert response.status_code == 200
    assert response.json()["event_type"] == "invoice.paid"

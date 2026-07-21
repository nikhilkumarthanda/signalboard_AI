from datetime import UTC, datetime
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest

app = FastAPI(title="SignalBoard Analytics API", version="1.0.0")

class Scenario(BaseModel):
    current_arr: float = Field(24.8, gt=0)
    pricing_increase_pct: float = Field(8, ge=0, le=50)
    monthly_churn_pct: float = Field(2.8, ge=0, le=20)
    new_hires: int = Field(6, ge=0, le=200)

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now(UTC).isoformat()}

@app.get("/api/v1/kpis")
def kpis():
    return {"arr": 24_800_000, "nrr_pct": 118.6, "gross_margin_pct": 76.4, "runway_months": 21.4}

@app.post("/api/v1/scenarios")
def scenario(request: Scenario):
    retention = 1 + (3.4 - request.monthly_churn_pct) * .035
    arr = request.current_arr * (1 + request.pricing_increase_pct / 100) * retention
    return {"projected_arr": round(arr, 2), "gross_margin_pct": round(76.4 + request.pricing_increase_pct * .18 - request.new_hires * .12, 1), "runway_months": round(max(21.4 - request.new_hires * .42 + request.pricing_increase_pct * .16, 0), 1)}

@app.post("/api/v1/anomalies")
def anomalies(values: list[float]):
    if len(values) < 5:
        return {"anomaly_indices": []}
    labels = IsolationForest(random_state=42).fit_predict(np.asarray(values).reshape(-1, 1))
    return {"anomaly_indices": np.where(labels == -1)[0].tolist()}

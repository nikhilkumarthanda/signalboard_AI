from datetime import UTC, datetime
from typing import Literal

import numpy as np
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest

app = FastAPI(
    title="SignalBoard Analytics API",
    description="Decision-intelligence APIs for SaaS revenue, customers, product usage, and planning.",
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4173", "https://signalboard-ai.nikhilthanda6.chatgpt.site"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
MRR = [1.45, 1.52, 1.58, 1.67, 1.73, 1.82, 1.88, 1.96, 2.04, 2.13, 2.21, 2.31]


class ScenarioInput(BaseModel):
    current_arr: float = Field(24.8, gt=0)
    price: float = Field(8, ge=0, le=50)
    churn: float = Field(2.8, ge=0, le=20)
    hires: int = Field(6, ge=0, le=200)


class ScenarioResult(BaseModel):
    arr: float
    margin: float
    runway: float
    assumptions: dict[str, float | int]


class AlertUpdate(BaseModel):
    status: Literal["open", "resolved"]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "timestamp": datetime.now(UTC).isoformat()}


@app.get("/api/v1/company")
def company(period: str = Query("12m", pattern="^(30d|qtd|12m)$")) -> dict:
    """Return the normalized executive dataset. Replace this adapter with warehouse queries in production."""
    return {
        "mode": "demo",
        "period": period,
        "generated_at": datetime.now(UTC).isoformat(),
        "data": {
            "company": {"name": "Northstar Labs", "plan": "Enterprise"},
            "kpis": {"arr": 24.8, "mrr": 2.31, "nrr": 118.6, "margin": 76.4, "runway": 21.4, "customers": 3842},
            "revenue": {"months": MONTHS, "mrr": MRR},
            "usage": {"dau": 18420, "wau": 28640, "mau": 41280, "stickiness": 64.3},
        },
    }


@app.get("/api/v1/kpis")
def kpis() -> dict[str, float]:
    return {"arr": 24_800_000, "mrr": 2_310_000, "nrr_pct": 118.6, "gross_margin_pct": 76.4, "runway_months": 21.4}


@app.post("/api/v1/scenarios", response_model=ScenarioResult)
def scenario(request: ScenarioInput) -> ScenarioResult:
    retention = 1 + (3.4 - request.churn) * 0.035
    arr = request.current_arr * (1 + request.price / 100) * retention
    margin = 76.4 + request.price * 0.18 - request.hires * 0.12
    runway = max(21.4 - request.hires * 0.42 + request.price * 0.16, 0)
    return ScenarioResult(
        arr=round(arr, 1), margin=round(margin, 1), runway=round(runway, 1),
        assumptions={"price": request.price, "churn": request.churn, "hires": request.hires},
    )


@app.post("/api/v1/anomalies")
def anomalies(values: list[float]) -> dict[str, list[int]]:
    if len(values) < 5:
        return {"anomaly_indices": []}
    clean = np.nan_to_num(np.asarray(values, dtype=float), nan=float(np.nanmedian(values)))
    labels = IsolationForest(contamination="auto", random_state=42).fit_predict(clean.reshape(-1, 1))
    return {"anomaly_indices": np.where(labels == -1)[0].tolist()}


@app.patch("/api/v1/alerts/{alert_id}")
def update_alert(alert_id: int, update: AlertUpdate) -> dict[str, int | str]:
    return {"id": alert_id, "status": update.status}

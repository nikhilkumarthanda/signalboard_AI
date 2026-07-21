from datetime import UTC, datetime
from typing import Literal

import numpy as np
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, root_mean_squared_error

app = FastAPI(
    title="SignalBoard Analytics API",
    description="Decision-intelligence APIs for SaaS revenue, customers, product usage, and planning.",
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4173", "https://signalboard-ai.nikhilthanda6.chatgpt.site"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
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


class ForecastInput(BaseModel):
    values: list[float] = Field(min_length=8, max_length=120)
    horizon: int = Field(6, ge=1, le=24)


class HealthInput(BaseModel):
    usage_change_pct: float = Field(0, ge=-100, le=500)
    feature_adoption_pct: float = Field(50, ge=0, le=100)
    open_tickets: int = Field(0, ge=0, le=1000)
    payment_failures: int = Field(0, ge=0, le=100)
    renewal_days: int = Field(90, ge=0, le=3650)


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
def anomalies(values: list[float]) -> dict:
    if len(values) < 5:
        return {"method": "isolation_forest", "anomalies": [], "anomaly_indices": []}
    clean = np.nan_to_num(np.asarray(values, dtype=float), nan=float(np.nanmedian(values)))
    model = IsolationForest(contamination="auto", random_state=42)
    points = clean.reshape(-1, 1)
    labels = model.fit_predict(points)
    scores = -model.score_samples(points)
    indices = np.where(labels == -1)[0].tolist()
    return {
        "method": "isolation_forest",
        "anomaly_indices": indices,
        "anomalies": [{"index": i, "value": float(clean[i]), "severity": round(float(scores[i]), 4)} for i in indices],
    }


@app.post("/api/v1/forecasts")
def forecast(request: ForecastInput) -> dict:
    """Fit a linear-trend baseline with a chronological holdout and transparent error metrics."""
    values = np.asarray(request.values, dtype=float)
    split = max(5, int(len(values) * 0.75))
    train_x = np.arange(split).reshape(-1, 1)
    test_x = np.arange(split, len(values)).reshape(-1, 1)
    validation_model = LinearRegression().fit(train_x, values[:split])
    validation = validation_model.predict(test_x)
    actual = values[split:]
    metrics = {
        "mae": round(float(mean_absolute_error(actual, validation)), 4),
        "rmse": round(float(root_mean_squared_error(actual, validation)), 4),
        "mape_pct": round(float(mean_absolute_percentage_error(actual, validation) * 100), 2),
    }
    model = LinearRegression().fit(np.arange(len(values)).reshape(-1, 1), values)
    future_x = np.arange(len(values), len(values) + request.horizon).reshape(-1, 1)
    predictions = model.predict(future_x)
    residual_std = float(np.std(actual - validation)) if len(actual) > 1 else 0.0
    margin = 1.96 * residual_std
    return {
        "method": "linear_trend_baseline",
        "training_points": len(values),
        "holdout_points": len(actual),
        "metrics": metrics,
        "forecast": [round(float(v), 4) for v in predictions],
        "lower_95": [round(float(v - margin), 4) for v in predictions],
        "upper_95": [round(float(v + margin), 4) for v in predictions],
        "limitations": "Baseline assumes the historical linear trend continues; intervals use holdout residual dispersion.",
    }


@app.post("/api/v1/customer-health")
def customer_health(request: HealthInput) -> dict:
    score = 70.0
    drivers: list[dict[str, float | str]] = []
    usage_impact = max(-35.0, min(20.0, request.usage_change_pct * 0.6))
    adoption_impact = (request.feature_adoption_pct - 50) * 0.25
    ticket_impact = -min(request.open_tickets * 2.5, 20)
    payment_impact = -min(request.payment_failures * 12, 30)
    renewal_impact = -15 if request.renewal_days < 30 else (-7 if request.renewal_days < 60 else 0)
    for label, impact in [("usage trend", usage_impact), ("feature adoption", adoption_impact),
                          ("support load", ticket_impact), ("payment reliability", payment_impact),
                          ("renewal proximity", renewal_impact)]:
        if impact:
            drivers.append({"driver": label, "impact": round(float(impact), 1)})
    score = round(max(0, min(100, score + sum(float(d["impact"]) for d in drivers))), 1)
    band = "healthy" if score >= 75 else ("monitor" if score >= 50 else "at_risk")
    return {"score": score, "band": band, "method": "explainable_weighted_score", "drivers": drivers}


@app.patch("/api/v1/alerts/{alert_id}")
def update_alert(alert_id: int, update: AlertUpdate) -> dict[str, int | str]:
    return {"id": alert_id, "status": update.status}

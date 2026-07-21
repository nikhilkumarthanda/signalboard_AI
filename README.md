# SignalBoard AI

SignalBoard is an executive decision-intelligence platform for SaaS companies. It unifies revenue, customer, product, and operating data; detects important changes; forecasts outcomes; and translates the results into actionable executive briefings.

## Highlights

- KPI command center for ARR, NRR, margin, and runway
- Revenue forecasting and prioritized business signals
- Interactive pricing, churn, and hiring scenario studio
- AI-style executive briefings
- Connector-ready architecture for Stripe, Salesforce, HubSpot, and warehouses
- Responsive executive interface

## Architecture

```text
Business systems → Connectors → Normalized data → Python analytics API → Executive app
```

The public demo uses deterministic fictional data. The included FastAPI service shows how live company data and Python models connect to the product.

## Stack

React 19, TypeScript, Vinext, Python, FastAPI, Pandas, NumPy, scikit-learn, and Cloudflare-compatible deployment.

## Run locally

```bash
npm ci
npm run dev
```

For the analytics service:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

All organizations and figures in the demo are fictional.

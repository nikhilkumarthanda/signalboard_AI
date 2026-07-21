import { companyData } from "@/lib/demo-data";

function localBaseline(values: number[], horizon: number) {
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  const slope = values.reduce((sum, y, x) => sum + (x - meanX) * (y - meanY), 0) /
    values.reduce((sum, _y, x) => sum + (x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  return Array.from({ length: horizon }, (_, i) => Number((intercept + slope * (n + i)).toFixed(3)));
}

export async function GET() {
  const values = companyData.revenue.mrr;
  const analyticsUrl = process.env.ANALYTICS_API_URL?.replace(/\/$/, "");
  if (analyticsUrl) {
    try {
      const response = await fetch(`${analyticsUrl}/api/v1/forecasts`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ values, horizon: 8 }),
      });
      if (response.ok) return Response.json({ ...(await response.json()), source: "python_fastapi" });
    } catch { /* expose fallback explicitly */ }
  }
  return Response.json({
    method: "linear_trend_baseline", source: "typescript_fallback",
    forecast: localBaseline(values, 8), metrics: null,
    limitations: "Python service is not configured; this response uses the disclosed TypeScript linear baseline.",
  });
}

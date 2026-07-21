import { calculateScenario } from "@/lib/demo-data";

export async function POST(request: Request) {
  const body = await request.json();
  const price = Math.min(Math.max(Number(body.price) || 0, 0), 50);
  const churn = Math.min(Math.max(Number(body.churn) || 0, 0), 20);
  const hires = Math.min(Math.max(Number(body.hires) || 0, 0), 200);
  const analyticsUrl = process.env.ANALYTICS_API_URL?.replace(/\/$/, "");
  if (analyticsUrl) {
    try {
      const response = await fetch(`${analyticsUrl}/api/v1/scenarios`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ price, churn, hires, current_arr: 24.8 }),
      });
      if (response.ok) return Response.json({ ...(await response.json()), source: "python_fastapi" });
    } catch { /* deterministic fallback keeps the demo usable */ }
  }
  return Response.json({ ...calculateScenario(price, churn, hires), assumptions: { price, churn, hires }, source: "typescript_fallback" });
}

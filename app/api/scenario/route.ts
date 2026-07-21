import { calculateScenario } from "@/lib/demo-data";

export async function POST(request: Request) {
  const body = await request.json();
  const price = Math.min(Math.max(Number(body.price) || 0, 0), 50);
  const churn = Math.min(Math.max(Number(body.churn) || 0, 0), 20);
  const hires = Math.min(Math.max(Number(body.hires) || 0, 0), 200);
  return Response.json({ ...calculateScenario(price, churn, hires), assumptions: { price, churn, hires } });
}

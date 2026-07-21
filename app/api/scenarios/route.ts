import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { scenarios } from "@/db/schema";
import { calculateScenario } from "@/lib/demo-data";
import { requestUser } from "@/lib/server-auth";

export async function GET(request: Request) {
  const ownerEmail = requestUser(request);
  const db = await getDb();
  const rows = await db.select().from(scenarios)
    .where(eq(scenarios.ownerEmail, ownerEmail))
    .orderBy(desc(scenarios.createdAt)).limit(25);
  return Response.json({ scenarios: rows });
}

export async function POST(request: Request) {
  const ownerEmail = requestUser(request);
  const body = await request.json() as Record<string, unknown>;
  const name = String(body.name || "Untitled scenario").trim().slice(0, 80);
  const price = Math.min(Math.max(Number(body.price) || 0, 0), 50);
  const churn = Math.min(Math.max(Number(body.churn) || 0, 0), 20);
  const hires = Math.round(Math.min(Math.max(Number(body.hires) || 0, 0), 200));
  const outcome = calculateScenario(price, churn, hires);
  const db = await getDb();
  const [saved] = await db.insert(scenarios).values({
    ownerEmail, name, price, churn, hires, ...outcome, createdAt: new Date().toISOString(),
  }).returning();
  return Response.json({ scenario: saved }, { status: 201 });
}

export async function DELETE(request: Request) {
  const ownerEmail = requestUser(request);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return Response.json({ error: "valid id required" }, { status: 400 });
  const db = await getDb();
  await db.delete(scenarios).where(and(eq(scenarios.id, id), eq(scenarios.ownerEmail, ownerEmail)));
  return new Response(null, { status: 204 });
}

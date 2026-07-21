import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { alertStates } from "@/db/schema";
import { requestUser } from "@/lib/server-auth";

const allowed = new Set(["open", "acknowledged", "resolved", "dismissed"]);

export async function GET(request: Request) {
  const ownerEmail = requestUser(request);
  const db = await getDb();
  const states = await db.select().from(alertStates).where(eq(alertStates.ownerEmail, ownerEmail));
  return Response.json({ states });
}

export async function PATCH(request: Request) {
  const ownerEmail = requestUser(request);
  const body = await request.json() as Record<string, unknown>;
  const alertId = Number(body.alertId);
  const status = String(body.status || "");
  if (!Number.isInteger(alertId) || !allowed.has(status)) {
    return Response.json({ error: "valid alertId and status required" }, { status: 400 });
  }
  const db = await getDb();
  await db.delete(alertStates).where(and(eq(alertStates.alertId, alertId), eq(alertStates.ownerEmail, ownerEmail)));
  const [state] = await db.insert(alertStates).values({
    alertId, ownerEmail, status: status as "open" | "acknowledged" | "resolved" | "dismissed",
    assignee: body.assignee ? String(body.assignee).slice(0, 100) : null,
    note: body.note ? String(body.note).slice(0, 500) : null,
    updatedAt: new Date().toISOString(),
  }).returning();
  return Response.json({ state });
}

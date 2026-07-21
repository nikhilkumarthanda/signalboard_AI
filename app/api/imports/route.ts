import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { imports } from "@/db/schema";
import { requestUser } from "@/lib/server-auth";

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV needs a header and at least one row");
  const headers = lines[0].split(",").map(x => x.trim().toLowerCase());
  const customerIndex = headers.indexOf("customer");
  const mrrIndex = headers.indexOf("mrr");
  if (customerIndex < 0 || mrrIndex < 0) throw new Error("Required columns: customer,mrr");
  const rows = lines.slice(1).map(line => line.split(",").map(x => x.trim()));
  const valid = rows.filter(row => row[customerIndex] && Number.isFinite(Number(row[mrrIndex])) && Number(row[mrrIndex]) >= 0);
  return { rowCount: rows.length, validRows: valid.length, totalMrr: valid.reduce((sum, row) => sum + Number(row[mrrIndex]), 0) };
}

export async function GET(request: Request) {
  const ownerEmail = requestUser(request);
  const db = await getDb();
  const history = await db.select().from(imports).where(eq(imports.ownerEmail, ownerEmail))
    .orderBy(desc(imports.importedAt)).limit(10);
  return Response.json({ imports: history });
}

export async function POST(request: Request) {
  const ownerEmail = requestUser(request);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 2_000_000) {
    return Response.json({ error: "CSV file required (maximum 2 MB)" }, { status: 400 });
  }
  try {
    const metrics = parseCsv(await file.text());
    const db = await getDb();
    const [record] = await db.insert(imports).values({
      ownerEmail, fileName: file.name.slice(0, 160), ...metrics, importedAt: new Date().toISOString(),
    }).returning();
    return Response.json({ import: record, metrics: { mrr: metrics.totalMrr, arr: metrics.totalMrr * 12 } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid CSV" }, { status: 422 });
  }
}

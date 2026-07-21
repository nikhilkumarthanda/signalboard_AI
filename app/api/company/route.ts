import { companyData } from "@/lib/demo-data";

export async function GET() {
  return Response.json({ data: companyData, mode: "demo", generatedAt: new Date().toISOString() });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET() {
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    const [orgCount, userCount, leadCount] = await Promise.all([
      db.organization.count(),
      db.user.count(),
      db.lead.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      latencyMs,
      stats: { organizations: orgCount, users: userCount, leads: leadCount },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : "Database unreachable",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

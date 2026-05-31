import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(_req: NextRequest) {
  const start = Date.now();
  let dbStatus: "operational" | "degraded" | "outage" = "operational";
  let dbLatencyMs = 0;

  try {
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    if (dbLatencyMs > 2000) dbStatus = "degraded";
  } catch {
    dbStatus = "outage";
    dbLatencyMs = Date.now() - start;
  }

  const [openIncidents, queueDepth] = await Promise.all([
    db.supportTicket.count({ where: { status: "open" } }).catch(() => 0),
    db.aiJob.count({ where: { status: "queued" } }).catch(() => 0),
  ]);
  let queueStatus: "operational" | "degraded" | "outage" = queueDepth > 500 ? "degraded" : "operational";

  const overall: "operational" | "degraded" | "outage" =
    dbStatus === "outage" ? "outage" :
    dbStatus === "degraded" || queueStatus === "degraded" ? "degraded" : "operational";

  const payload = {
    status: overall,
    updatedAt: new Date().toISOString(),
    components: {
      api: { status: "operational" as const, latencyMs: Date.now() - start },
      database: { status: dbStatus, latencyMs: dbLatencyMs },
      queue: { status: queueStatus, depth: queueDepth },
    },
    metrics: {
      openSupportTickets: openIncidents,
    },
    incidents: [] as { title: string; status: string; createdAt: string }[],
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=30",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

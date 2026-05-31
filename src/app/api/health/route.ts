import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  let dbLatencyMs = -1;

  try {
    const t = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
    dbLatencyMs = Date.now() - t;
  } catch {
    // db check failed
  }

  const status = dbOk ? "ok" : "degraded";
  const httpStatus = dbOk ? 200 : 503;

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "unknown",
    checks: {
      database: { status: dbOk ? "ok" : "error", latencyMs: dbLatencyMs },
    },
    totalLatencyMs: Date.now() - start,
  }, { status: httpStatus });
}

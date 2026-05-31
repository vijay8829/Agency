import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET() {
  try {
    const [queued, processing, failed, stuck] = await Promise.all([
      db.aiJob.count({ where: { status: "queued" } }),
      db.aiJob.count({ where: { status: "processing" } }),
      db.aiJob.count({ where: { status: "failed" } }),
      // Jobs stuck in processing for > 10 minutes
      db.aiJob.count({
        where: {
          status: "processing",
          startedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) },
        },
      }),
    ]);

    const healthy = stuck === 0;

    return NextResponse.json({
      status: healthy ? "ok" : "degraded",
      queue: { queued, processing, failed, stuck },
      timestamp: new Date().toISOString(),
    }, { status: healthy ? 200 : 207 });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : "Queue check failed",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

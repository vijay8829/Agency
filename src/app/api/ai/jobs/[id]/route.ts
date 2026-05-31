import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;

    const job = await db.aiJob.findFirst({ where: { id, organizationId: user.orgId } });
    if (!job) throw Err.notFound("AI job not found.");

    return ok(job);
  } catch (err) {
    return errorResponse(err);
  }
}

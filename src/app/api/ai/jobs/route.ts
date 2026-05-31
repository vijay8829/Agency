import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { paginationSchema } from "@/lib/server/validate";
import { created, errorResponse, paginated } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { z } from "zod";

const createJobSchema = z.object({
  type: z.string().min(1).max(60),
  prompt: z.string().min(1).max(10000),
  model: z.string().max(60).optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const { page, limit, order } = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const where = { organizationId: user.orgId };
    const [items, total] = await Promise.all([
      db.aiJob.findMany({ where, orderBy: { queuedAt: order }, skip: (page - 1) * limit, take: limit }),
      db.aiJob.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const usage = await db.usageTracking.findFirst({
      where: { organizationId: user.orgId, metric: "ai_tasks", period: new Date().toISOString().slice(0, 7) },
    });

    const subscription = await db.subscription.findFirst({
      where: { organizationId: user.orgId, status: "active" },
    });

    const planLimits: Record<string, number> = { starter: 5, pro: 100, agency: -1 };
    const limit = planLimits[subscription?.plan ?? "starter"] ?? 5;

    if (limit !== -1 && ((usage?.count ?? 0) >= limit)) {
      throw Err.validation(`AI task quota reached for your plan (${limit}/month). Upgrade to get more.`);
    }

    const data = createJobSchema.parse(await req.json());
    const job = await db.aiJob.create({
      data: {
        type: data.type,
        prompt: data.prompt,
        model: data.model,
        priority: data.priority,
        organizationId: user.orgId,
        createdById: user.sub,
        status: "queued",
        retryCount: 0,
      },
    });

    await db.usageTracking.upsert({
      where: { organizationId_metric_period: { organizationId: user.orgId, metric: "ai_tasks", period: new Date().toISOString().slice(0, 7) } },
      update: { count: { increment: 1 } },
      create: { organizationId: user.orgId, metric: "ai_tasks", period: new Date().toISOString().slice(0, 7), count: 1 },
    });

    await audit(user, { action: "ai.job.create", resource: "ai_job", resourceId: job.id, newValue: { type: data.type, priority: data.priority } });
    return created(job);
  } catch (err) {
    return errorResponse(err);
  }
}

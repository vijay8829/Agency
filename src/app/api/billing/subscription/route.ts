import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { audit } from "@/lib/server/audit";
import { billingRateLimit } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";
import { z } from "zod";

const changePlanSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const subscription = await db.subscription.findFirst({
      where: { organizationId: user.orgId },
      orderBy: { createdAt: "desc" },
    });
    return ok(subscription);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    billingRateLimit(user.orgId);

    const { plan } = changePlanSchema.parse(await req.json());
    logger.billing("plan_change.requested", { orgId: user.orgId, plan });

    const existing = await db.subscription.findFirst({
      where: { organizationId: user.orgId, status: "active" },
    });

    const subscription = existing
      ? await db.subscription.update({ where: { id: existing.id }, data: { plan } })
      : await db.subscription.create({ data: { organizationId: user.orgId, plan, status: "active" } });

    await db.billingEvent.create({
      data: { organizationId: user.orgId, type: "plan_change", description: `Changed to ${plan}`, metadata: JSON.stringify({ from: existing?.plan ?? "none", to: plan }) },
    });

    await audit(user, { action: "billing.plan_change", resource: "subscription", resourceId: subscription.id, oldValue: existing?.plan, newValue: plan });

    return ok(subscription);
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { getPlan, isTrialing, trialDaysRemaining } from "@/lib/server/limits";
import { audit } from "@/lib/server/audit";
import { z } from "zod";

const startTrialSchema = z.object({
  plan: z.enum(["starter", "pro", "agency", "enterprise"]).default("pro"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const sub = await db.subscription.findFirst({
      where: { organizationId: user.orgId },
      orderBy: { createdAt: "desc" },
    });

    const plan = getPlan(sub?.plan ?? "starter");

    return ok({
      hasTrial: !!sub && sub.status === "trialing",
      trialActive: sub ? isTrialing(sub) : false,
      trialDaysRemaining: sub ? trialDaysRemaining(sub) : 0,
      trialEndsAt: sub?.trialEndsAt ?? null,
      plan: plan.name,
      trialDays: plan.trialDays,
      canStartTrial: !sub,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    apiRateLimit(user.orgId);

    const existing = await db.subscription.findFirst({ where: { organizationId: user.orgId } });
    if (existing) throw Err.conflict("A subscription already exists. Trials are only available for new accounts.");

    const { plan } = startTrialSchema.parse(await req.json());
    const planConfig = getPlan(plan);
    const trialStartAt = new Date();
    const trialEndsAt = new Date(Date.now() + planConfig.trialDays * 24 * 60 * 60 * 1000);

    const sub = await db.subscription.create({
      data: { organizationId: user.orgId, plan, status: "trialing", trialStartAt, trialEndsAt },
    });

    await audit(user, { action: "billing.trial_start", resource: "subscription", resourceId: sub.id, newValue: { plan, trialEndsAt } });

    return ok({ subscription: sub, trialDaysRemaining: planConfig.trialDays, message: `${planConfig.trialDays}-day free trial started on ${planConfig.name}.` });
  } catch (err) {
    return errorResponse(err);
  }
}

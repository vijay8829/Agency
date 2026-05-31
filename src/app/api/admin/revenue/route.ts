import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { adminRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { PLANS } from "@/lib/server/limits";
import { Err } from "@/lib/server/errors";

function assertAdminSecret(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) throw Err.forbidden("Invalid admin secret.");
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [activeSubs, trialSubs, cancelledThisMonth, newThisMonth, billingEvents] = await Promise.all([
      db.subscription.findMany({ where: { status: "active" }, select: { plan: true, interval: true, organizationId: true } }),
      db.subscription.count({ where: { status: "trialing" } }),
      db.subscription.count({ where: { status: "cancelled", updatedAt: { gte: startOfMonth } } }),
      db.subscription.count({ where: { status: "active", createdAt: { gte: startOfMonth } } }),
      db.billingEvent.findMany({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, type: "payment_succeeded" },
        select: { amount: true },
      }),
    ]);

    let mrr = 0;
    for (const sub of activeSubs) {
      const plan = PLANS[sub.plan];
      if (!plan || plan.price <= 0) continue;
      mrr += sub.interval === "annual" ? Math.round(plan.price * 12 / 12) : plan.price;
    }
    const arr = mrr * 12;

    const lastMonthRevenue = billingEvents.reduce((sum, e) => sum + (e.amount ?? 0), 0);

    const baseCount = activeSubs.length + cancelledThisMonth;
    const churnRate = baseCount > 0 ? Math.round((cancelledThisMonth / baseCount) * 10000) / 100 : 0;

    const converted = await db.subscription.count({
      where: { status: "active", trialStartAt: { not: null }, createdAt: { gte: startOfMonth } },
    });

    const planCounts: Record<string, number> = {};
    for (const sub of activeSubs) {
      planCounts[sub.plan] = (planCounts[sub.plan] ?? 0) + 1;
    }

    const arpu = activeSubs.length > 0 ? Math.round(mrr / activeSubs.length) : 0;
    const ltv = churnRate > 0 ? Math.round(arpu / (churnRate / 100)) : arpu * 24;

    return ok({
      mrr,
      arr,
      arpu,
      ltv,
      lastMonthRevenue,
      activeSubscriptions: activeSubs.length,
      trialSubscriptions: trialSubs,
      newThisMonth,
      cancelledThisMonth,
      churnRate,
      trialConversions: converted,
      planDistribution: planCounts,
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

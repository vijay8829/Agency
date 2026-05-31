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
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      activeSubs,
      trialSubs,
      cancelledLastMonth,
      newSignupsThisMonth,
      newSignupsLastMonth,
      activeUsers30d,
      totalUsers,
      failedPayments,
      completedOnboarding,
      totalOnboarding,
      openTickets,
      pendingAlerts,
      aiJobsThisMonth,
      suspendedOrgs,
    ] = await Promise.all([
      db.subscription.findMany({ where: { status: "active" }, select: { plan: true, interval: true } }),
      db.subscription.count({ where: { status: "trialing" } }),
      db.subscription.count({ where: { status: "cancelled", updatedAt: { gte: startOfLastMonth } } }),
      db.organization.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.organization.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      db.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
      db.user.count({ where: { deletedAt: null } }),
      db.billingEvent.count({ where: { type: "payment_failed", createdAt: { gte: thirtyDaysAgo } } }),
      db.onboardingProgress.count({ where: { completedAt: { not: null } } }),
      db.onboardingProgress.count(),
      db.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
      db.customerAlert.count({ where: { acknowledged: false, severity: "critical" } }),
      db.aiJob.count({ where: { queuedAt: { gte: startOfMonth } } }),
      db.organization.count({ where: { planStatus: "suspended" } }),
    ]);

    // MRR
    let mrr = 0;
    for (const sub of activeSubs) {
      const plan = PLANS[sub.plan];
      if (plan && plan.price > 0) mrr += plan.price;
    }

    // Signup growth %
    const signupGrowth = newSignupsLastMonth > 0
      ? Math.round(((newSignupsThisMonth - newSignupsLastMonth) / newSignupsLastMonth) * 100)
      : newSignupsThisMonth > 0 ? 100 : 0;

    // Active user rate
    const activeUserRate = totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0;

    // Onboarding completion rate
    const onboardingRate = totalOnboarding > 0 ? Math.round((completedOnboarding / totalOnboarding) * 100) : 0;

    // Churn rate
    const churnBase = activeSubs.length + cancelledLastMonth;
    const churnRate = churnBase > 0 ? Math.round((cancelledLastMonth / churnBase) * 10000) / 100 : 0;

    // Auth failure check (abuse proxy)
    const recentAuthFailures = await db.auditLog.count({
      where: { action: "auth.login_failed", createdAt: { gte: sevenDaysAgo } },
    }).catch(() => 0);

    const planDistribution: Record<string, number> = {};
    for (const sub of activeSubs) {
      planDistribution[sub.plan] = (planDistribution[sub.plan] ?? 0) + 1;
    }

    return ok({
      revenue: {
        mrr,
        arr: mrr * 12,
        activeSubscriptions: activeSubs.length,
        trialSubscriptions: trialSubs,
        churnRate,
        planDistribution,
      },
      growth: {
        newSignupsThisMonth,
        newSignupsLastMonth,
        signupGrowthPct: signupGrowth,
      },
      engagement: {
        totalUsers,
        activeUsersLast30d: activeUsers30d,
        activeUserRatePct: activeUserRate,
        onboardingCompletionRatePct: onboardingRate,
        aiJobsThisMonth,
      },
      health: {
        openSupportTickets: openTickets,
        criticalAlertsUnacknowledged: pendingAlerts,
        failedPaymentsLast30d: failedPayments,
        suspendedOrgs,
        recentAuthFailuresLast7d: recentAuthFailures,
      },
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

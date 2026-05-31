import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";

function checkAdminSecret(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) throw Err.forbidden("Invalid admin secret.");
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "owner");
    checkAdminSecret(req);

    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrgs,
      activeOrgs,
      totalUsers,
      newUsersThisMonth,
      totalLeads,
      totalClients,
      totalInvoices,
      subscriptions,
      failedPayments,
      aiJobsThisMonth,
      aiJobsLastMonth,
      automationRuns,
      auditLogsToday,
      activeOrgIds,
    ] = await Promise.all([
      db.organization.count(),
      db.organization.count({ where: { users: { some: { lastLoginAt: { gte: thirtyDaysAgo } } } } }),
      db.user.count({ where: { deletedAt: null } }),
      db.user.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
      db.lead.count({ where: { deletedAt: null } }),
      db.client.count({ where: { deletedAt: null } }),
      db.invoice.count({ where: { deletedAt: null } }),
      db.subscription.findMany({ where: { status: "active" } }),
      db.billingEvent.count({ where: { type: "payment_failed", createdAt: { gte: thirtyDaysAgo } } }),
      db.aiJob.count({ where: { queuedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
      db.aiJob.count({ where: { queuedAt: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1), lt: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
      db.automationRun.count({ where: { startedAt: { gte: thirtyDaysAgo } } }),
      db.auditLog.count({ where: { createdAt: { gte: new Date(now.toISOString().slice(0, 10)) } } }),
      db.user.findMany({ where: { lastLoginAt: { gte: thirtyDaysAgo }, deletedAt: null }, select: { organizationId: true }, distinct: ["organizationId"] }),
    ]);

    // MRR calculation based on active subscriptions
    const PLAN_MRR: Record<string, number> = { starter: 29, pro: 49, agency: 149 };
    const mrr = subscriptions.reduce((sum, sub) => sum + (PLAN_MRR[sub.plan] ?? 0), 0);

    // Churn: orgs that had an active sub and cancelled in last 30 days
    const churnedCount = await db.billingEvent.count({
      where: { type: "subscription_cancelled", createdAt: { gte: thirtyDaysAgo } },
    });

    // Plan distribution
    const planDistribution = subscriptions.reduce<Record<string, number>>((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] ?? 0) + 1;
      return acc;
    }, {});

    // Usage by metric this month
    const usageThisMonth = await db.usageTracking.findMany({ where: { period: thisMonth } });
    const usageSummary = usageThisMonth.reduce<Record<string, number>>((acc, u) => {
      acc[u.metric] = (acc[u.metric] ?? 0) + u.count;
      return acc;
    }, {});

    return ok({
      overview: {
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        totalUsers,
        newUsersThisMonth,
        mrr,
        mrrFormatted: `$${mrr.toLocaleString()}`,
        churnedThisMonth: churnedCount,
        churnRate: totalOrgs > 0 ? parseFloat(((churnedCount / totalOrgs) * 100).toFixed(2)) : 0,
      },
      content: {
        totalLeads,
        totalClients,
        totalInvoices,
      },
      ai: {
        jobsThisMonth: aiJobsThisMonth,
        jobsLastMonth: aiJobsLastMonth,
        growth: aiJobsLastMonth > 0 ? parseFloat((((aiJobsThisMonth - aiJobsLastMonth) / aiJobsLastMonth) * 100).toFixed(1)) : null,
        automationRuns,
      },
      billing: {
        activeSubscriptions: subscriptions.length,
        failedPaymentsThisMonth: failedPayments,
        planDistribution,
      },
      usage: usageSummary,
      security: {
        auditLogsToday,
        activeOrgsLast30Days: activeOrgIds.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

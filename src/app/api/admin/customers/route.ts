import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { adminRateLimit, getClientIp } from "@/lib/server/rate-limit";
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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [orgs, recentActivity] = await Promise.all([
      db.organization.findMany({
        include: {
          subscriptions: { select: { plan: true, status: true, createdAt: true, trialEndsAt: true }, take: 1, orderBy: { createdAt: "desc" } },
          _count: { select: { leads: true, clients: true } },
        },
      }),
      db.auditLog.groupBy({
        by: ["organizationId"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
    ]);

    const activityMap = new Map(recentActivity.map(r => [r.organizationId, r._count.id]));

    const customers = orgs
      .filter(o => o.subscriptions.length > 0)
      .map(org => {
        const activityCount = activityMap.get(org.id) ?? 0;
        const sub = org.subscriptions[0];

        let score = 50;
        if (activityCount > 20) score += 20;
        else if (activityCount < 3) score -= 20;
        if (org._count.clients > 5) score += 10;
        if (org._count.leads > 10) score += 10;
        if (sub.status === "trialing") score -= 10;
        score = Math.max(0, Math.min(100, score));

        const churnRisk: "low" | "medium" | "high" =
          score < 30 ? "high" : score < 60 ? "medium" : "low";

        const trialExpiringSoon = sub.trialEndsAt
          ? sub.trialEndsAt > new Date() && sub.trialEndsAt < sevenDaysFromNow
          : false;

        return {
          orgId: org.id,
          orgName: org.name,
          plan: sub.plan,
          status: sub.status,
          healthScore: score,
          churnRisk,
          trialExpiringSoon,
          activityLast30Days: activityCount,
          leadCount: org._count.leads,
          clientCount: org._count.clients,
          customerSince: sub.createdAt,
        };
      })
      .sort((a, b) => a.healthScore - b.healthScore);

    const summary = {
      total: customers.length,
      highRisk: customers.filter(c => c.churnRisk === "high").length,
      mediumRisk: customers.filter(c => c.churnRisk === "medium").length,
      trialExpiringSoon: customers.filter(c => c.trialExpiringSoon).length,
    };

    return ok({ summary, customers });
  } catch (err) {
    return errorResponse(err);
  }
}

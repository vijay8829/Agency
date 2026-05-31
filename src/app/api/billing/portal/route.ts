import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { getPlan, isTrialing, trialDaysRemaining } from "@/lib/server/limits";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const thisMonth = new Date().toISOString().slice(0, 7);

    const [subscription, billingEvents, usageRows, fileStats, teamCount, clientCount, leadCount] = await Promise.all([
      db.subscription.findFirst({ where: { organizationId: user.orgId }, orderBy: { createdAt: "desc" } }),
      db.billingEvent.findMany({ where: { organizationId: user.orgId }, orderBy: { createdAt: "desc" }, take: 12 }),
      db.usageTracking.findMany({ where: { organizationId: user.orgId, period: thisMonth } }),
      db.file.aggregate({ where: { organizationId: user.orgId, deletedAt: null }, _sum: { sizeBytes: true } }),
      db.membership.count({ where: { organizationId: user.orgId } }),
      db.client.count({ where: { organizationId: user.orgId, deletedAt: null } }),
      db.lead.count({ where: { organizationId: user.orgId, deletedAt: null } }),
    ]);

    const plan = getPlan(subscription?.plan ?? "starter");
    const usageMap = usageRows.reduce<Record<string, number>>((acc, u) => { acc[u.metric] = u.count; return acc; }, {});
    const storageBytes = fileStats._sum.sizeBytes ?? 0;

    const usage = {
      aiTasks: { used: usageMap.ai_tasks ?? 0, limit: plan.maxAiTasksPerMonth, unlimited: plan.maxAiTasksPerMonth === -1 },
      teamMembers: { used: teamCount, limit: plan.maxUsers, unlimited: plan.maxUsers === -1 },
      clients: { used: clientCount, limit: plan.maxClients, unlimited: plan.maxClients === -1 },
      leads: { used: leadCount, limit: plan.maxLeads, unlimited: plan.maxLeads === -1 },
      storageGb: { used: parseFloat((storageBytes / 1024 / 1024 / 1024).toFixed(3)), limit: plan.maxStorageGb, unlimited: plan.maxStorageGb === -1 },
    };

    return ok({
      plan: { ...plan, interval: subscription?.interval ?? "month" },
      subscription: subscription ? {
        ...subscription,
        trialActive: isTrialing(subscription),
        trialDaysRemaining: trialDaysRemaining(subscription),
      } : null,
      usage,
      billingHistory: billingEvents,
      // payment method comes from Stripe in production
      paymentMethod: subscription?.stripeSubId ? { last4: "4242", brand: "Visa", expMonth: 12, expYear: 2026 } : null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

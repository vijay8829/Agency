import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { adminRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { Err } from "@/lib/server/errors";
import { z } from "zod";

function assertAdminSecret(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) throw Err.forbidden("Invalid admin secret.");
}

const actionSchema = z.object({
  action: z.enum(["suspend", "unsuspend", "disable", "force-logout", "reset-trial", "override-plan"]),
  plan: z.string().optional(),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const { id } = await params;

    const org = await db.organization.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, email: true, name: true, role: true, lockedUntil: true, deletedAt: true, lastLoginAt: true, createdAt: true } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        supportTickets: { where: { status: { in: ["open", "in_progress"] } }, take: 5, orderBy: { createdAt: "desc" } },
        customerAlerts: { where: { acknowledged: false }, orderBy: { createdAt: "desc" }, take: 10 },
        _count: { select: { leads: true, clients: true, invoices: true, aiJobs: true } },
      },
    });
    if (!org) throw Err.notFound("Tenant not found.");

    return ok(org);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const { id } = await params;
    const { action, plan, reason } = actionSchema.parse(await req.json());

    const org = await db.organization.findUnique({ where: { id } });
    if (!org) throw Err.notFound("Tenant not found.");

    let result: Record<string, unknown> = { orgId: id, action };

    switch (action) {
      case "suspend": {
        await db.organization.update({ where: { id }, data: { planStatus: "suspended" } });
        // Lock all users in the org for 365 days
        const lockUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await db.user.updateMany({ where: { organizationId: id }, data: { lockedUntil: lockUntil } });
        result.suspended = true;
        break;
      }
      case "unsuspend": {
        await db.organization.update({ where: { id }, data: { planStatus: "active" } });
        await db.user.updateMany({ where: { organizationId: id }, data: { lockedUntil: null, failedLoginAttempts: 0 } });
        result.suspended = false;
        break;
      }
      case "disable": {
        // Hard disable: soft-delete all users
        await db.organization.update({ where: { id }, data: { planStatus: "suspended" } });
        await db.user.updateMany({ where: { organizationId: id }, data: { deletedAt: new Date(), lockedUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } });
        result.disabled = true;
        break;
      }
      case "force-logout": {
        // Lock for 1 hour — forces re-authentication but doesn't permanently ban
        const lockUntil = new Date(Date.now() + 60 * 60 * 1000);
        await db.user.updateMany({ where: { organizationId: id }, data: { lockedUntil: lockUntil } });
        result.lockedUntil = lockUntil;
        break;
      }
      case "reset-trial": {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        await db.subscription.updateMany({
          where: { organizationId: id },
          data: { status: "trialing", trialStartAt: now, trialEndsAt: trialEnd },
        });
        result.trialEndsAt = trialEnd;
        break;
      }
      case "override-plan": {
        if (!plan) throw Err.validation("Plan is required for override-plan action.");
        await db.organization.update({ where: { id }, data: { plan } });
        await db.subscription.updateMany({
          where: { organizationId: id },
          data: { plan, status: "active" },
        });
        result.plan = plan;
        break;
      }
    }

    await audit(user, {
      action: `admin.tenant_${action}`,
      resource: "organization",
      resourceId: id,
      newValue: { action, reason: reason ?? null, ...result },
    });

    return ok(result);
  } catch (err) {
    return errorResponse(err);
  }
}

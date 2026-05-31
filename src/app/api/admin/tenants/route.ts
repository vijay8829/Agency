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

    const orgs = await db.organization.findMany({
      include: {
        subscriptions: { take: 1, orderBy: { createdAt: "desc" }, select: { plan: true, status: true, createdAt: true, trialEndsAt: true } },
        _count: { select: { users: true, clients: true, leads: true, supportTickets: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const tenants = orgs.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      planStatus: org.planStatus,
      plan: org.subscriptions[0]?.plan ?? org.plan,
      subStatus: org.subscriptions[0]?.status ?? "none",
      trialEndsAt: org.subscriptions[0]?.trialEndsAt,
      userCount: org._count.users,
      clientCount: org._count.clients,
      leadCount: org._count.leads,
      openTickets: org._count.supportTickets,
      createdAt: org.createdAt,
      suspended: org.planStatus === "suspended",
    }));

    return ok({ total: tenants.length, tenants });
  } catch (err) {
    return errorResponse(err);
  }
}

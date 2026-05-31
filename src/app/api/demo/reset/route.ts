import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { Err } from "@/lib/server/errors";

const DEMO_ORG_NAME = "Acme Agency";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "owner");
    apiRateLimit(user.orgId);

    const org = await db.organization.findUnique({ where: { id: user.orgId }, select: { name: true } });
    if (org?.name !== DEMO_ORG_NAME) throw Err.forbidden("Reset is only available on the demo workspace.");

    await Promise.all([
      db.lead.deleteMany({ where: { organizationId: user.orgId } }),
      db.client.deleteMany({ where: { organizationId: user.orgId } }),
      db.invoice.deleteMany({ where: { organizationId: user.orgId } }),
      db.automationRun.deleteMany({ where: { automation: { organizationId: user.orgId } } }),
      db.notification.deleteMany({ where: { organizationId: user.orgId } }),
      db.contentItem.deleteMany({ where: { organizationId: user.orgId } }),
      db.aiJob.deleteMany({ where: { organizationId: user.orgId } }),
      db.auditLog.deleteMany({ where: { organizationId: user.orgId } }),
      db.supportTicket.deleteMany({ where: { organizationId: user.orgId } }),
      db.announcementRead.deleteMany({ where: { organizationId: user.orgId } }),
    ]);

    const now = new Date();
    await Promise.all([
      db.lead.createMany({
        data: [
          { organizationId: user.orgId, name: "Alice Johnson", email: "alice@brightdesigns.com", company: "Bright Designs", status: "new", source: "website", value: "4500" },
          { organizationId: user.orgId, name: "Bob Chen", email: "bob@techflow.io", company: "TechFlow", status: "contacted", source: "referral", value: "12000" },
          { organizationId: user.orgId, name: "Carol Smith", email: "carol@greenleaf.org", company: "GreenLeaf", status: "qualified", source: "linkedin", value: "7800" },
          { organizationId: user.orgId, name: "David Patel", email: "david@nexasolutions.com", company: "Nexa Solutions", status: "proposal", source: "cold_email", value: "22000" },
          { organizationId: user.orgId, name: "Eve Thompson", email: "eve@rapidgrowth.co", company: "RapidGrowth", status: "won", source: "website", value: "9500" },
        ],
      }),
      db.client.createMany({
        data: [
          { organizationId: user.orgId, name: "Bright Designs", contact: "Alice Johnson", email: "hello@brightdesigns.com", status: "active" },
          { organizationId: user.orgId, name: "TechFlow Inc", contact: "Bob Chen", email: "billing@techflow.io", status: "active" },
          { organizationId: user.orgId, name: "GreenLeaf Org", contact: "Carol Smith", email: "accounts@greenleaf.org", status: "active" },
          { organizationId: user.orgId, name: "Nexa Solutions", contact: "David Patel", email: "finance@nexasolutions.com", status: "at-risk" },
        ],
      }),
      db.notification.createMany({
        data: [
          { organizationId: user.orgId, userId: user.sub, type: "system", title: "Welcome to AgencyOS Demo", body: "Explore all features. Reset anytime.", read: false },
          { organizationId: user.orgId, userId: user.sub, type: "lead", title: "New lead: Eve Thompson", body: "Won $9,500 deal from RapidGrowth.", read: false },
        ],
      }),
    ]);

    return ok({ reset: true, resetAt: now.toISOString() });
  } catch (err) {
    return errorResponse(err);
  }
}

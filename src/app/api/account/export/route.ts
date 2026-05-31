import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, created, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const requests = await db.dataExportRequest.findMany({
      where: { organizationId: user.orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return ok(requests);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const pending = await db.dataExportRequest.findFirst({
      where: { organizationId: user.orgId, status: { in: ["pending", "processing"] } },
    });
    if (pending) {
      return ok({ message: "Export already in progress.", request: pending });
    }

    const request = await db.dataExportRequest.create({
      data: { organizationId: user.orgId, requestedById: user.sub, status: "pending" },
    });

    await audit(user, { action: "account.export_requested", resource: "organization", resourceId: user.orgId });

    // In a real system a background worker picks this up and emails a download link.
    // Here we synchronously generate the export payload and mark it complete.
    const [leads, clients, invoices, members] = await Promise.all([
      db.lead.findMany({ where: { organizationId: user.orgId, deletedAt: null } }),
      db.client.findMany({ where: { organizationId: user.orgId, deletedAt: null } }),
      db.invoice.findMany({ where: { organizationId: user.orgId, deletedAt: null } }),
      db.membership.findMany({ where: { organizationId: user.orgId }, include: { user: { select: { id: true, email: true, name: true, createdAt: true } } } }),
    ]);

    const exportData = { exportedAt: new Date().toISOString(), leads, clients, invoices, members };
    const url = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;

    const completed = await db.dataExportRequest.update({
      where: { id: request.id },
      data: { status: "completed", completedAt: new Date(), downloadUrl: url },
    });

    return created({ request: completed, data: exportData });
  } catch (err) {
    return errorResponse(err);
  }
}

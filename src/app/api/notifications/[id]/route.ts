import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateNotificationSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;

    const notif = await db.notification.findFirst({ where: { id, organizationId: user.orgId, userId: user.sub } });
    if (!notif) throw Err.notFound("Notification not found.");

    const data = updateNotificationSchema.parse(await req.json());
    const updated = await db.notification.update({ where: { id }, data });
    return ok(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;

    const notif = await db.notification.findFirst({ where: { id, organizationId: user.orgId, userId: user.sub } });
    if (!notif) throw Err.notFound("Notification not found.");

    await db.notification.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

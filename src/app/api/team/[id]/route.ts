import { NextRequest } from "next/server";
import { requireAuth, requireRole, isOwner } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateMemberSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    apiRateLimit(user.orgId);
    const { id } = await params;

    const membership = await db.membership.findFirst({ where: { id, organizationId: user.orgId } });
    if (!membership) throw Err.notFound("Member not found.");
    if (membership.role === "owner") throw Err.forbidden("Cannot change the owner's role.");

    const { role } = updateMemberSchema.parse(await req.json());
    const updated = await db.membership.update({ where: { id }, data: { role } });

    await audit(user, { action: "team.role_change", resource: "membership", resourceId: id, oldValue: { role: membership.role }, newValue: { role } });
    return ok(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    apiRateLimit(user.orgId);
    const { id } = await params;

    const membership = await db.membership.findFirst({ where: { id, organizationId: user.orgId } });
    if (!membership) throw Err.notFound("Member not found.");
    if (membership.role === "owner") throw Err.forbidden("Cannot remove the organization owner.");
    if (membership.userId === user.sub) throw Err.forbidden("Cannot remove yourself.");

    await db.membership.delete({ where: { id } });

    await audit(user, { action: "team.remove", resource: "membership", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

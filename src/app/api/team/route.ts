import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { inviteMemberSchema } from "@/lib/server/validate";
import { ok, created, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { checkLimit } from "@/lib/server/limits";
import { hashPassword } from "@/lib/server/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const members = await db.membership.findMany({
      where: { organizationId: user.orgId },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true, lastLoginAt: true, createdAt: true } } },
      orderBy: { createdAt: "asc" },
    });

    return ok(members.map(m => ({ ...m.user, role: m.role, memberId: m.id })));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    apiRateLimit(user.orgId);
    await checkLimit({ orgId: user.orgId, resource: "users" });

    const data = inviteMemberSchema.parse(await req.json());

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      const existingMembership = await db.membership.findFirst({
        where: { userId: existing.id, organizationId: user.orgId },
      });
      if (existingMembership) throw Err.conflict("This user is already a member of your organization.");
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(tempPassword);

    const newUser = existing ?? await db.user.create({
      data: { email: data.email, name: data.name, passwordHash, role: data.role, organizationId: user.orgId },
    });

    const membership = await db.membership.create({
      data: { userId: newUser.id, organizationId: user.orgId, role: data.role, invitedById: user.sub },
    });

    // In production: send invite email with tempPassword or invite link
    console.info(`[Team Invite] ${data.email} invited to org ${user.orgId} as ${data.role}`);

    await audit(user, { action: "team.invite", resource: "membership", resourceId: membership.id, newValue: { email: data.email, role: data.role } });

    return created({ id: newUser.id, email: newUser.email, name: newUser.name, role: data.role, memberId: membership.id });
  } catch (err) {
    return errorResponse(err);
  }
}

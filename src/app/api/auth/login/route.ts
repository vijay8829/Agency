import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/server/auth";
import { loginSchema } from "@/lib/server/validate";
import { Err } from "@/lib/server/errors";
import { ok, errorResponse } from "@/lib/server/response";
import { authRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { auditAnon } from "@/lib/server/audit";

export async function POST(req: NextRequest) {
  try {
    authRateLimit(getClientIp(req));

    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await db.user.findFirst({
      where: { email: data.email, deletedAt: null },
      include: { organization: true },
    });

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      await auditAnon({
        action: "auth.login.failed",
        ipAddress: getClientIp(req),
        metadata: { email: data.email },
        severity: "warning",
      });
      // Increment failed attempts if user exists
      if (user) {
        const attempts = (user.failedLoginAttempts ?? 0) + 1;
        const lockData = attempts >= 10 ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {};
        await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, ...lockData } });
      }
      throw Err.unauthorized("Invalid email or password.");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw Err.unauthorized("Account temporarily locked. Please try again later.");
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null },
    });

    const membership = await db.membership.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
    });

    const role = membership?.role ?? user.role;

    const token = await signToken({
      sub: user.id,
      orgId: user.organizationId,
      role,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    await auditAnon({
      action: "auth.login",
      ipAddress: getClientIp(req),
      metadata: { userId: user.id, orgId: user.organizationId },
    });

    return ok({
      user: { id: user.id, email: user.email, name: user.name, role },
      organization: { id: user.organization.id, name: user.organization.name },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

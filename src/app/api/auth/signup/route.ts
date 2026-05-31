import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { hashPassword, signToken, setSessionCookie } from "@/lib/server/auth";
import { signupSchema } from "@/lib/server/validate";
import { Err } from "@/lib/server/errors";
import { ok, errorResponse } from "@/lib/server/response";
import { authRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { auditAnon } from "@/lib/server/audit";
import { emailService } from "@/lib/server/email";
import { logger } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  try {
    authRateLimit(getClientIp(req));

    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) throw Err.conflict("An account with this email already exists.");

    const passwordHash = await hashPassword(data.password);

    const result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug: data.organizationName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now(),
        },
      });

      const user = await tx.user.create({
        data: { email: data.email, name: data.name, passwordHash, role: "owner", organizationId: org.id },
      });

      await tx.membership.create({
        data: { userId: user.id, organizationId: org.id, role: "owner" },
      });

      await tx.settings.create({
        data: { organizationId: org.id },
      });

      return { org, user };
    });

    const token = await signToken({
      sub: result.user.id,
      orgId: result.org.id,
      role: "owner",
      email: result.user.email,
      name: result.user.name,
    });

    await setSessionCookie(token);

    // Fire-and-forget welcome email
    emailService.sendWelcome(
      result.user.email,
      result.user.name,
      result.org.name,
      `${process.env.APP_URL ?? "http://localhost:3000"}/app`
    ).then(r => {
      if (!r.delivered) logger.warn("signup: welcome email failed", { userId: result.user.id, error: r.error });
    });

    await auditAnon({
      action: "auth.signup",
      ipAddress: getClientIp(req),
      metadata: { email: data.email, orgId: result.org.id },
    });

    return ok({
      user: { id: result.user.id, email: result.user.email, name: result.user.name, role: "owner" },
      organization: { id: result.org.id, name: result.org.name },
    }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}

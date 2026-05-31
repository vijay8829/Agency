import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { forgotPasswordSchema } from "@/lib/server/validate";
import { ok, errorResponse } from "@/lib/server/response";
import { authRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { auditAnon } from "@/lib/server/audit";
import { emailService } from "@/lib/server/email";
import { logger } from "@/lib/server/logger";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    authRateLimit(getClientIp(req));

    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);

    const user = await db.user.findFirst({ where: { email: data.email, deletedAt: null } });

    // Always return success — prevents email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
      const result = await emailService.sendPasswordReset(user.email, user.name, resetUrl);

      if (!result.delivered) {
        logger.warn("auth.forgot_password: email delivery failed", { userId: user.id, error: result.error });
      }

      await auditAnon({
        action: "auth.forgot_password",
        ipAddress: getClientIp(req),
        metadata: { email: data.email },
      });
    }

    return ok({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (err) {
    return errorResponse(err);
  }
}

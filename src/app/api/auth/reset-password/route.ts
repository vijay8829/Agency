import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth";
import { resetPasswordSchema } from "@/lib/server/validate";
import { Err } from "@/lib/server/errors";
import { ok, errorResponse } from "@/lib/server/response";
import { resetPasswordRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { auditAnon } from "@/lib/server/audit";

export async function POST(req: NextRequest) {
  try {
    resetPasswordRateLimit(getClientIp(req));

    const body = await req.json();
    const data = resetPasswordSchema.parse(body);

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token: data.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw Err.validation("Reset token is invalid or has expired.");
    }

    const newHash = await hashPassword(data.password);

    await db.$transaction([
      db.user.update({ where: { id: resetToken.userId }, data: { passwordHash: newHash, failedLoginAttempts: 0, lockedUntil: null } }),
      db.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    await auditAnon({
      action: "auth.password_reset",
      ipAddress: getClientIp(req),
      metadata: { userId: resetToken.userId },
    });

    return ok({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth, requireRole, clearSessionCookie } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { z } from "zod";

const deleteSchema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "owner");
    apiRateLimit(user.orgId);

    deleteSchema.parse(await req.json());

    const sub = await db.subscription.findFirst({
      where: { organizationId: user.orgId, status: { in: ["active", "trialing"] } },
    });
    if (sub) {
      const { Err } = await import("@/lib/server/errors");
      throw Err.validation("Cancel your subscription before deleting your account.");
    }

    await db.user.updateMany({
      where: { organizationId: user.orgId },
      data: { deletedAt: new Date() },
    });

    // Store deletion intent in settings (timezone field repurposed as flag in absence of metadata column)
    await db.settings.upsert({
      where: { organizationId: user.orgId },
      update: { ownerEmail: `DELETED:${new Date().toISOString()}` },
      create: { organizationId: user.orgId, ownerEmail: `DELETED:${new Date().toISOString()}` },
    });

    await clearSessionCookie();
    return ok({ deleted: true, message: "Account scheduled for deletion. Data will be purged within 30 days." });
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateSettingsSchema } from "@/lib/server/validate";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const settings = await db.settings.findUnique({ where: { organizationId: user.orgId } });
    return ok(settings);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const data = updateSettingsSchema.parse(await req.json());
    const old = await db.settings.findUnique({ where: { organizationId: user.orgId } });

    const settings = await db.settings.upsert({
      where: { organizationId: user.orgId },
      update: data,
      create: { organizationId: user.orgId, ...data },
    });

    await audit(user, { action: "settings.update", resource: "settings", resourceId: user.orgId, oldValue: old, newValue: settings });
    return ok(settings);
  } catch (err) {
    return errorResponse(err);
  }
}

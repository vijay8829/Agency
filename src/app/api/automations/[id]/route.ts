import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateAutomationSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

async function getAutomation(id: string, orgId: string) {
  const a = await db.automation.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
  if (!a) throw Err.notFound("Automation not found.");
  return a;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    return ok(await getAutomation(id, user.orgId));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const old = await getAutomation(id, user.orgId);
    const data = updateAutomationSchema.parse(await req.json());
    const automation = await db.automation.update({ where: { id }, data });
    await audit(user, { action: "automation.update", resource: "automation", resourceId: id, oldValue: old, newValue: automation });
    return ok(automation);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    await getAutomation(id, user.orgId);
    await db.automation.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(user, { action: "automation.delete", resource: "automation", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

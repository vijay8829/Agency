import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateContentSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

async function getContent(id: string, orgId: string) {
  const item = await db.contentItem.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
  if (!item) throw Err.notFound("Content item not found.");
  return item;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    return ok(await getContent(id, user.orgId));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const old = await getContent(id, user.orgId);
    const data = updateContentSchema.parse(await req.json());
    const item = await db.contentItem.update({ where: { id }, data });
    await audit(user, { action: "content.update", resource: "content", resourceId: id, oldValue: old, newValue: item });
    return ok(item);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    await getContent(id, user.orgId);
    await db.contentItem.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(user, { action: "content.delete", resource: "content", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

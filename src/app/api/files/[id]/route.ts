import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { storage } from "@/lib/server/files";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;

    const file = await db.file.findFirst({ where: { id, organizationId: user.orgId, deletedAt: null } });
    if (!file) throw Err.notFound("File not found.");

    return ok({ ...file, url: storage.getUrl(file.storageKey) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;

    const file = await db.file.findFirst({ where: { id, organizationId: user.orgId, deletedAt: null } });
    if (!file) throw Err.notFound("File not found.");
    if (file.uploadedBy !== user.sub) throw Err.forbidden("You can only delete your own files.");

    await db.file.update({ where: { id }, data: { deletedAt: new Date() } });
    await storage.delete(file.storageKey);
    await audit(user, { action: "file.delete", resource: "file", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

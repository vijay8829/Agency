import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateClientSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

async function getClient(id: string, orgId: string) {
  const client = await db.client.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
  if (!client) throw Err.notFound("Client not found.");
  return client;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const client = await getClient(id, user.orgId);
    return ok(client);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const old = await getClient(id, user.orgId);
    const body = await req.json();
    const data = updateClientSchema.parse(body);
    const client = await db.client.update({ where: { id }, data });
    await audit(user, { action: "client.update", resource: "client", resourceId: id, oldValue: old, newValue: client });
    return ok(client);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    await getClient(id, user.orgId);
    await db.client.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(user, { action: "client.delete", resource: "client", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

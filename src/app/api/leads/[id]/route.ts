import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateLeadSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

async function getLead(id: string, orgId: string) {
  const lead = await db.lead.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
  if (!lead) throw Err.notFound("Lead not found.");
  return lead;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const lead = await getLead(id, user.orgId);
    return ok(lead);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const old = await getLead(id, user.orgId);
    const body = await req.json();
    const data = updateLeadSchema.parse(body);
    const lead = await db.lead.update({ where: { id }, data });
    await audit(user, { action: "lead.update", resource: "lead", resourceId: id, oldValue: old, newValue: lead });
    return ok(lead);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    await getLead(id, user.orgId);
    await db.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(user, { action: "lead.delete", resource: "lead", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

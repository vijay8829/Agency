import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { updateInvoiceSchema } from "@/lib/server/validate";
import { ok, noContent, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

async function getInvoice(id: string, orgId: string) {
  const invoice = await db.invoice.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
  if (!invoice) throw Err.notFound("Invoice not found.");
  return invoice;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    return ok(await getInvoice(id, user.orgId));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const old = await getInvoice(id, user.orgId);
    const data = updateInvoiceSchema.parse(await req.json());
    const invoice = await db.invoice.update({ where: { id }, data });
    await audit(user, { action: "invoice.update", resource: "invoice", resourceId: id, oldValue: old, newValue: invoice });
    return ok(invoice);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    await getInvoice(id, user.orgId);
    await db.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(user, { action: "invoice.delete", resource: "invoice", resourceId: id });
    return noContent();
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const ticket = await db.supportTicket.findFirst({ where: { id, organizationId: user.orgId }, include: { replies: { orderBy: { createdAt: "asc" } } } });
    if (!ticket) throw Err.notFound("Ticket not found.");
    return ok(ticket);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const ticket = await db.supportTicket.findFirst({ where: { id, organizationId: user.orgId } });
    if (!ticket) throw Err.notFound("Ticket not found.");
    const data = updateSchema.parse(await req.json());
    const resolvedAt = data.status === "resolved" ? new Date() : ticket.resolvedAt;
    const closedAt = data.status === "closed" ? new Date() : ticket.closedAt;
    const updated = await db.supportTicket.update({ where: { id }, data: { ...data, resolvedAt, closedAt } });
    await audit(user, { action: "support.ticket_updated", resource: "ticket", resourceId: id, newValue: data });
    return ok(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

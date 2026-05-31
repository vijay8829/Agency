import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, created, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { z } from "zod";

const replySchema = z.object({
  body: z.string().min(5).max(10000).trim(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const ticket = await db.supportTicket.findFirst({ where: { id, organizationId: user.orgId } });
    if (!ticket) throw Err.notFound("Ticket not found.");
    const replies = await db.ticketReply.findMany({ where: { ticketId: id, isInternal: false }, orderBy: { createdAt: "asc" } });
    return ok(replies);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { id } = await params;
    const ticket = await db.supportTicket.findFirst({ where: { id, organizationId: user.orgId } });
    if (!ticket) throw Err.notFound("Ticket not found.");
    if (ticket.status === "closed") throw Err.validation("Cannot reply to a closed ticket.");
    const { body } = replySchema.parse(await req.json());
    const [reply] = await Promise.all([
      db.ticketReply.create({ data: { ticketId: id, authorId: user.sub, authorName: user.name, body } }),
      db.supportTicket.update({ where: { id }, data: { status: "waiting", updatedAt: new Date() } }),
    ]);
    return created(reply);
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, created, errorResponse, paginated } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { paginationSchema } from "@/lib/server/validate";
import { audit } from "@/lib/server/audit";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(5).max(200).trim(),
  body: z.string().min(20).max(10000).trim(),
  category: z.enum(["billing", "technical", "feature", "onboarding", "other"]).default("technical"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { page, limit, order } = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const where = { organizationId: user.orgId };
    const [items, total] = await Promise.all([
      db.supportTicket.findMany({ where, include: { replies: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { createdAt: order }, skip: (page - 1) * limit, take: limit }),
      db.supportTicket.count({ where }),
    ]);
    return paginated(items, total, page, limit);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const data = createTicketSchema.parse(await req.json());
    const ticket = await db.supportTicket.create({
      data: { ...data, organizationId: user.orgId, userId: user.sub },
    });
    await audit(user, { action: "support.ticket_created", resource: "ticket", resourceId: ticket.id, newValue: { subject: data.subject, category: data.category } });
    return created(ticket);
  } catch (err) {
    return errorResponse(err);
  }
}

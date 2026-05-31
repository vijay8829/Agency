import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { createLeadSchema, paginationSchema } from "@/lib/server/validate";
import { ok, created, errorResponse, paginated } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { checkLimit } from "@/lib/server/limits";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const { page, limit, search, sort, order } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );

    const where = {
      organizationId: user.orgId,
      deletedAt: null,
      ...(search ? { OR: [{ name: { contains: search } }, { company: { contains: search } }, { email: { contains: search } }] } : {}),
    };

    const [items, total] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { [sort ?? "createdAt"]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lead.count({ where }),
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
    await checkLimit({ orgId: user.orgId, resource: "leads" });

    const body = await req.json();
    const data = createLeadSchema.parse(body);

    const lead = await db.lead.create({
      data: { ...data, organizationId: user.orgId, createdById: user.sub },
    });

    await audit(user, { action: "lead.create", resource: "lead", resourceId: lead.id, newValue: lead });

    return created(lead);
  } catch (err) {
    return errorResponse(err);
  }
}

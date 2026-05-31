import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { createInvoiceSchema, paginationSchema } from "@/lib/server/validate";
import { created, errorResponse, paginated } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";

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
      ...(search ? { OR: [{ client: { contains: search } }, { project: { contains: search } }] } : {}),
    };

    const [items, total] = await Promise.all([
      db.invoice.findMany({
        where,
        orderBy: { [sort ?? "createdAt"]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
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

    const body = await req.json();
    const data = createInvoiceSchema.parse(body);

    const invoice = await db.invoice.create({
      data: { ...data, organizationId: user.orgId, createdById: user.sub },
    });

    await audit(user, { action: "invoice.create", resource: "invoice", resourceId: invoice.id, newValue: invoice });

    return created(invoice);
  } catch (err) {
    return errorResponse(err);
  }
}

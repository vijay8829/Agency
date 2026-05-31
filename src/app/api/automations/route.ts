import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { createAutomationSchema, paginationSchema } from "@/lib/server/validate";
import { created, errorResponse, paginated } from "@/lib/server/response";
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
      ...(search ? { OR: [{ name: { contains: search } }, { trigger: { contains: search } }] } : {}),
    };

    const [items, total] = await Promise.all([
      db.automation.findMany({ where, orderBy: { [sort ?? "createdAt"]: order }, skip: (page - 1) * limit, take: limit }),
      db.automation.count({ where }),
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
    await checkLimit({ orgId: user.orgId, resource: "automations" });

    const data = createAutomationSchema.parse(await req.json());
    const automation = await db.automation.create({
      data: { ...data, organizationId: user.orgId, createdById: user.sub },
    });

    await audit(user, { action: "automation.create", resource: "automation", resourceId: automation.id, newValue: automation });
    return created(automation);
  } catch (err) {
    return errorResponse(err);
  }
}

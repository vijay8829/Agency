import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { paginationSchema } from "@/lib/server/validate";
import { errorResponse, paginated } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");

    const adminSecret = req.headers.get("x-admin-secret");
    const isGlobalAdmin = adminSecret === process.env.ADMIN_SECRET;

    const { page, limit, order } = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const where = isGlobalAdmin ? {} : { organizationId: user.orgId };

    const [items, total] = await Promise.all([
      db.auditLog.findMany({ where, orderBy: { createdAt: order }, skip: (page - 1) * limit, take: limit }),
      db.auditLog.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { paginationSchema } from "@/lib/server/validate";
import { ok, errorResponse, paginated } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";

function checkAdminSecret(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) throw Err.forbidden("Invalid admin secret.");
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "owner");
    checkAdminSecret(req);

    const { page, limit, search, order } = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const where = search
      ? { OR: [{ email: { contains: search } }, { name: { contains: search } }], deletedAt: null }
      : { deletedAt: null };

    const [items, total] = await Promise.all([
      db.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, organizationId: true, createdAt: true, lastLoginAt: true },
        orderBy: { createdAt: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  } catch (err) {
    return errorResponse(err);
  }
}

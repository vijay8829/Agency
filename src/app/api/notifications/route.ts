import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { paginationSchema } from "@/lib/server/validate";
import { ok, errorResponse, paginated } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const { page, limit, order } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );

    const where = { organizationId: user.orgId, userId: user.sub };

    const [items, total] = await Promise.all([
      db.notification.findMany({ where, orderBy: { createdAt: order }, skip: (page - 1) * limit, take: limit }),
      db.notification.count({ where }),
    ]);

    return paginated(items, total, page, limit);
  } catch (err) {
    return errorResponse(err);
  }
}

// Mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    await db.notification.updateMany({
      where: { organizationId: user.orgId, userId: user.sub, read: false },
      data: { read: true },
    });

    return ok({ message: "All notifications marked as read." });
  } catch (err) {
    return errorResponse(err);
  }
}

// Clear all
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    await db.notification.deleteMany({
      where: { organizationId: user.orgId, userId: user.sub },
    });

    return ok({ message: "All notifications cleared." });
  } catch (err) {
    return errorResponse(err);
  }
}

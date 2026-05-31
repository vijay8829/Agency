import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const [dbUser, org] = await Promise.all([
      db.user.findUnique({
        where: { id: user.sub, deletedAt: null },
        select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true, avatarUrl: true },
      }),
      db.organization.findUnique({
        where: { id: user.orgId },
        select: { id: true, name: true, slug: true, plan: true, createdAt: true },
      }),
    ]);

    if (!dbUser || !org) {
      return errorResponse(new Error("User not found"));
    }

    return ok({ user: { ...dbUser, role: user.role }, organization: org });
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { z } from "zod";

const markReadSchema = z.object({ announcementId: z.string() });

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const sub = await db.subscription.findFirst({ where: { organizationId: user.orgId } });
    const now = new Date();

    const announcements = await db.announcement.findMany({
      where: {
        published: true,
        publishedAt: { lte: now },
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          { OR: [{ targetPlan: null }, { targetPlan: sub?.plan ?? "starter" }] },
        ],
      },
      include: { reads: { where: { organizationId: user.orgId } } },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });

    return ok(announcements.map(a => ({ ...a, read: a.reads.length > 0, reads: undefined })));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { announcementId } = markReadSchema.parse(await req.json());

    await db.announcementRead.upsert({
      where: { announcementId_organizationId: { announcementId, organizationId: user.orgId } },
      update: {},
      create: { announcementId, organizationId: user.orgId },
    });

    return ok({ marked: true });
  } catch (err) {
    return errorResponse(err);
  }
}

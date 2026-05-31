import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, created, errorResponse } from "@/lib/server/response";
import { adminRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { Err } from "@/lib/server/errors";
import { z } from "zod";

function assertAdminSecret(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) throw Err.forbidden("Invalid admin secret.");
}

const createSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  body: z.string().min(10).max(5000).trim(),
  type: z.enum(["info", "warning", "success", "maintenance"]).default("info"),
  targetPlan: z.string().nullable().default(null),
  publishedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  published: z.boolean().default(false),
});

const updateSchema = createSchema.partial().extend({
  published: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const announcements = await db.announcement.findMany({
      include: { _count: { select: { reads: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(announcements);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const data = createSchema.parse(await req.json());

    const announcement = await db.announcement.create({
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.published ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return created(announcement);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const { id, ...rest } = updateSchema.extend({ id: z.string() }).parse(await req.json());

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...rest,
        publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : undefined,
        expiresAt: rest.expiresAt ? new Date(rest.expiresAt) : rest.expiresAt === null ? null : undefined,
      },
    });

    return ok(announcement);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    adminRateLimit(getClientIp(req));
    assertAdminSecret(req);

    const { id } = z.object({ id: z.string() }).parse(await req.json());
    await db.announcement.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, created, errorResponse, paginated } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";
import { validateFile, generateStorageKey, storage, PLAN_STORAGE_LIMITS } from "@/lib/server/files";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { paginationSchema } from "@/lib/server/validate";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const { page, limit, order } = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const where = { organizationId: user.orgId, deletedAt: null };

    const [items, total] = await Promise.all([
      db.file.findMany({ where, orderBy: { createdAt: order }, skip: (page - 1) * limit, take: limit }),
      db.file.count({ where }),
    ]);

    const itemsWithUrls = items.map(f => ({ ...f, url: storage.getUrl(f.storageKey) }));
    return paginated(itemsWithUrls, total, page, limit);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      throw Err.validation("Request must be multipart/form-data.");
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw Err.validation("No file provided in form data field 'file'.");
    }

    // Quota check
    const org = await db.organization.findUnique({ where: { id: user.orgId }, select: { plan: true } });
    const limit = PLAN_STORAGE_LIMITS[org?.plan ?? "starter"] ?? PLAN_STORAGE_LIMITS.starter;

    const totalSize = await db.file.aggregate({
      where: { organizationId: user.orgId, deletedAt: null },
      _sum: { sizeBytes: true },
    });

    const usedBytes = totalSize._sum.sizeBytes ?? 0;
    if (usedBytes + file.size > limit) {
      throw Err.validation(`Storage quota exceeded (${Math.round(limit / 1024 / 1024 / 1024)}GB limit for your plan).`);
    }

    // Read file bytes for magic byte check
    const buffer = await file.arrayBuffer();
    const firstBytes = new Uint8Array(buffer.slice(0, 16));

    const validation = validateFile({ name: file.name, type: file.type, size: file.size }, firstBytes);
    if (!validation.valid) throw Err.validation(validation.error ?? "File rejected.");

    const storageKey = generateStorageKey(user.orgId, file.name);
    await storage.write(storageKey, new Uint8Array(buffer));

    const record = await db.file.create({
      data: {
        organizationId: user.orgId,
        uploadedBy: user.sub,
        filename: storageKey.split("/").pop() ?? file.name,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storageKey,
        accessLevel: "org",
      },
    });

    await audit(user, { action: "file.upload", resource: "file", resourceId: record.id, newValue: { name: file.name, size: file.size, type: file.type } });

    return created({ ...record, url: storage.getUrl(storageKey) });
  } catch (err) {
    return errorResponse(err);
  }
}

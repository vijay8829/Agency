import { NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, created, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { audit } from "@/lib/server/audit";
import { Err } from "@/lib/server/errors";

function generateCode(orgName: string): string {
  const slug = orgName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const codes = await db.referralCode.findMany({
      where: { organizationId: user.orgId },
      include: { attributions: { orderBy: { createdAt: "desc" } } },
    });
    return ok(codes);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requireRole(user, "admin");
    apiRateLimit(user.orgId);

    const existing = await db.referralCode.findFirst({ where: { organizationId: user.orgId, status: "active" } });
    if (existing) throw Err.conflict("You already have an active referral code.");

    const org = await db.organization.findUnique({ where: { id: user.orgId }, select: { name: true } });
    const code = generateCode(org?.name ?? "AGENCY");

    const referral = await db.referralCode.create({
      data: { organizationId: user.orgId, code, commissionPct: 20 },
    });

    await audit(user, { action: "referral.code_created", resource: "referral", resourceId: referral.id, newValue: { code } });
    return created({ ...referral, shareUrl: `${process.env.APP_URL ?? ""}/signup?ref=${code}` });
  } catch (err) {
    return errorResponse(err);
  }
}

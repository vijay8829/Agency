import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { validateCoupon } from "@/lib/server/limits";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1).max(30) });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const { code } = schema.parse(await req.json());
    const result = validateCoupon(code);
    if (!result.valid) return errorResponse(new Error(result.error ?? "Invalid coupon"));
    return ok({ valid: true, code: code.toUpperCase().trim(), discountPct: result.pct, message: `${result.pct}% discount applied!` });
  } catch (err) {
    return errorResponse(err);
  }
}

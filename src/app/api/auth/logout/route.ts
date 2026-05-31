import { clearSessionCookie } from "@/lib/server/auth";
import { ok, errorResponse } from "@/lib/server/response";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ message: "Logged out successfully." });
  } catch (err) {
    return errorResponse(err);
  }
}

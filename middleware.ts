import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-minimum-32-chars-long-here"
);
const COOKIE_NAME = process.env.COOKIE_NAME ?? "agencyos_session";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const IS_PROD = process.env.NODE_ENV === "production";

// Origins that may access API routes — never accept wildcard tunnel URLs
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? APP_URL)
    .split(",")
    .map(o => o.trim())
    .filter(Boolean)
);

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/health",
  "/api/health/db",
  "/api/health/queue",
  "/api/health/storage",
]);

function generateTraceId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  // Static assets (have file extension)
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;
  return false;
}

function originAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests have no Origin header
  if (!IS_PROD) return true; // In dev, allow all origins
  return ALLOWED_ORIGINS.has(origin);
}

function addSecurityHeaders(res: NextResponse): void {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (IS_PROD) {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const traceId = generateTraceId();
  const origin = req.headers.get("origin");

  // ─── OPTIONS preflight (CORS) ─────────────────────────────────────────────
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS.values().next().value ?? APP_URL);
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Max-Age", "86400");
    return res;
  }

  // ─── CORS origin check for API routes ─────────────────────────────────────
  if (pathname.startsWith("/api/") && !originAllowed(origin)) {
    return NextResponse.json(
      { success: false, code: "FORBIDDEN", error: "Origin not allowed." },
      { status: 403, headers: { "X-Request-ID": traceId } }
    );
  }

  // ─── Public paths pass through ────────────────────────────────────────────
  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    res.headers.set("X-Request-ID", traceId);
    addSecurityHeaders(res);
    return res;
  }

  // ─── JWT authentication ────────────────────────────────────────────────────
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED", error: "Authentication required.", traceId },
        { status: 401, headers: { "X-Request-ID": traceId } }
      );
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const res = NextResponse.next();

    // Forward verified user context to route handlers
    res.headers.set("x-user-id", String(payload.sub ?? ""));
    res.headers.set("x-org-id", String((payload as Record<string, unknown>).orgId ?? ""));
    res.headers.set("x-user-role", String((payload as Record<string, unknown>).role ?? ""));
    res.headers.set("X-Request-ID", traceId);
    addSecurityHeaders(res);
    return res;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED", error: "Invalid or expired session.", traceId },
        { status: 401, headers: { "X-Request-ID": traceId } }
      );
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};

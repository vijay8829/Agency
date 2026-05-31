import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Err } from "./errors";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-minimum-32-chars-long-here"
);
const COOKIE_NAME = process.env.COOKIE_NAME ?? "agencyos_session";
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE ?? "604800", 10);

export interface JWTPayload {
  sub: string;         // userId
  orgId: string;       // organizationId
  role: string;        // owner | admin | manager | member | viewer
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, 12);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    throw Err.unauthorized("Invalid or expired session. Please log in again.");
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

// ─── Auth context ─────────────────────────────────────────────────────────────

export async function requireAuth(req?: NextRequest): Promise<JWTPayload> {
  let token: string | null = null;

  if (req) {
    // From request (middleware / edge)
    token = req.cookies.get(COOKIE_NAME)?.value ?? null;
    // Also support Bearer token for API clients
    const authHeader = req.headers.get("authorization");
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  } else {
    // From server component / route handler
    token = await getTokenFromCookies();
  }

  if (!token) throw Err.unauthorized();
  const payload = await verifyToken(token);

  // Revocation check: ensure account is not locked/suspended/deleted
  const dbUser = await db.user.findUnique({
    where: { id: payload.sub },
    select: { lockedUntil: true, deletedAt: true },
  });
  if (!dbUser || dbUser.deletedAt) throw Err.unauthorized("Account not found or has been deleted.");
  if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) throw Err.unauthorized("Account is suspended. Contact support.");

  return payload;
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
};

export function requireRole(user: JWTPayload, minRole: string): void {
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  if (userLevel < requiredLevel) {
    throw Err.forbidden(`Requires '${minRole}' role or higher.`);
  }
}

export function canWrite(user: JWTPayload): boolean {
  return (ROLE_HIERARCHY[user.role] ?? 0) >= ROLE_HIERARCHY.member;
}

export function canAdmin(user: JWTPayload): boolean {
  return (ROLE_HIERARCHY[user.role] ?? 0) >= ROLE_HIERARCHY.admin;
}

export function isOwner(user: JWTPayload): boolean {
  return user.role === "owner";
}

import { Err } from "./errors";

// In-memory rate limiter (suitable for single-process Node.js)
// For multi-instance production: replace store with Redis (ioredis + sliding window)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function rateLimit(key: string, max: number, windowSeconds: number): void {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;

  if (entry.count > max) {
    throw Err.rateLimit();
  }
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

export function authRateLimit(ip: string): void {
  const max = parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? "10", 10);
  const window = parseInt(process.env.RATE_LIMIT_AUTH_WINDOW ?? "900", 10);
  rateLimit(`auth:${ip}`, max, window);
}

export function apiRateLimit(orgId: string): void {
  const max = parseInt(process.env.RATE_LIMIT_API_MAX ?? "100", 10);
  const window = parseInt(process.env.RATE_LIMIT_API_WINDOW ?? "60", 10);
  rateLimit(`api:${orgId}`, max, window);
}

// Password reset — tighter: 5 per 15 minutes per IP
export function resetPasswordRateLimit(ip: string): void {
  rateLimit(`reset:${ip}`, 5, 900);
}

// File upload — 20 per 5 minutes per org
export function uploadRateLimit(orgId: string): void {
  rateLimit(`upload:${orgId}`, 20, 300);
}

// Billing actions — 10 per hour per org
export function billingRateLimit(orgId: string): void {
  rateLimit(`billing:${orgId}`, 10, 3600);
}

// Admin routes — 30 per minute per IP
export function adminRateLimit(ip: string): void {
  rateLimit(`admin:${ip}`, 30, 60);
}

// AI job creation — 30 per minute per org (quota enforcement is in the route)
export function aiRateLimit(orgId: string): void {
  rateLimit(`ai:${orgId}`, 30, 60);
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

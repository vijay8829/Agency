import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { Err } from "@/lib/server/errors";

// Public admin endpoint — guarded by ADMIN_SECRET header only
export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) throw Err.forbidden("Invalid admin secret.");

    const env = process.env;
    const isProd = env.NODE_ENV === "production";
    const checks: { name: string; pass: boolean; critical: boolean; detail?: string }[] = [];

    // ── Environment ────────────────────────────────────────────────────────────
    checks.push({ name: "DATABASE_URL set", pass: !!env.DATABASE_URL, critical: true });
    checks.push({ name: "JWT_SECRET min 32 chars", pass: (env.JWT_SECRET?.length ?? 0) >= 32, critical: true });
    checks.push({ name: "ADMIN_SECRET set", pass: !!env.ADMIN_SECRET, critical: true });
    checks.push({ name: "APP_URL set", pass: !!env.APP_URL, critical: isProd });
    checks.push({ name: "APP_URL is HTTPS", pass: (env.APP_URL ?? "").startsWith("https://"), critical: isProd, detail: isProd ? undefined : "Not required in dev" });
    checks.push({ name: "Stripe configured", pass: !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET, critical: false, detail: "Required for live payments" });
    checks.push({ name: "Email (Resend) configured", pass: !!env.RESEND_API_KEY, critical: false, detail: "Falls back to console in dev" });
    checks.push({ name: "JWT_SECRET not default", pass: !!(env.JWT_SECRET) && !env.JWT_SECRET.includes("fallback") && !env.JWT_SECRET.includes("dev-secret"), critical: isProd });
    checks.push({ name: "ADMIN_SECRET not default", pass: !!env.ADMIN_SECRET && env.ADMIN_SECRET !== "dev-admin-secret", critical: isProd });

    // ── Database ───────────────────────────────────────────────────────────────
    let dbOk = false;
    let dbLatencyMs = 0;
    try {
      const start = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbOk = true;
    } catch {}
    checks.push({ name: "Database reachable", pass: dbOk, critical: true });
    checks.push({ name: "Database latency <500ms", pass: dbLatencyMs < 500, critical: false, detail: `${dbLatencyMs}ms` });

    // ── Data ──────────────────────────────────────────────────────────────────
    let orgCount = 0;
    let subCount = 0;
    let planConfigured = false;
    try {
      [orgCount, subCount] = await Promise.all([
        db.organization.count(),
        db.subscription.count(),
      ]);
      planConfigured = true;
    } catch {}
    checks.push({ name: "Schema tables exist", pass: planConfigured, critical: true });
    checks.push({ name: "Seed data present", pass: orgCount > 0, critical: false, detail: `${orgCount} orgs` });

    // ── Security ──────────────────────────────────────────────────────────────
    checks.push({ name: "TUNNEL_URL not in production", pass: isProd ? !env.TUNNEL_URL : true, critical: isProd });
    checks.push({ name: "NODE_ENV=production", pass: isProd, critical: false, detail: isProd ? "✓" : "dev mode" });

    // ── Scoring ───────────────────────────────────────────────────────────────
    const critical = checks.filter(c => c.critical);
    const criticalPassed = critical.filter(c => c.pass).length;
    const all = checks;
    const allPassed = all.filter(c => c.pass).length;

    const criticalScore = critical.length > 0 ? Math.round((criticalPassed / critical.length) * 100) : 100;
    const overallScore = all.length > 0 ? Math.round((allPassed / all.length) * 100) : 100;

    const blockers = checks.filter(c => c.critical && !c.pass).map(c => c.name);
    const warnings = checks.filter(c => !c.critical && !c.pass).map(c => c.name);

    const readyToLaunch = blockers.length === 0;

    return ok({
      readyToLaunch,
      criticalScore,
      overallScore,
      dbLatencyMs,
      orgCount,
      subCount,
      checks,
      blockers,
      warnings,
      goLiveChecklist: {
        domain: { done: !!(env.APP_URL && env.APP_URL.startsWith("https://")), task: "Set APP_URL to production HTTPS domain" },
        ssl: { done: !!(env.APP_URL?.startsWith("https://")), task: "Configure SSL certificate on your host" },
        database: { done: dbOk, task: "Provision production PostgreSQL database" },
        secrets: { done: !env.JWT_SECRET?.includes("dev") && !env.ADMIN_SECRET?.includes("dev"), task: "Rotate all secrets to production values" },
        stripe: { done: !!env.STRIPE_SECRET_KEY, task: "Connect Stripe live keys" },
        email: { done: !!env.RESEND_API_KEY, task: "Connect Resend API key" },
        monitoring: { done: false, task: "Set up uptime monitoring (UptimeRobot, Better Uptime)" },
        backup: { done: false, task: "Schedule nightly database backups" },
        legal: { done: true, task: "Terms, Privacy, Cookie, Refund pages — done" },
        support: { done: true, task: "Support ticket system — done" },
        onboarding: { done: true, task: "Customer onboarding flow — done" },
        analytics: { done: true, task: "Admin revenue dashboard — done" },
        removeTunnel: { done: !env.TUNNEL_URL && isProd, task: "Remove TUNNEL_URL from production env" },
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

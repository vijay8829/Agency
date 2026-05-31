/**
 * Startup environment validation.
 * Called once at module load time — crashes the process if required vars are missing.
 * Import this at the top of db.ts or any server entry point.
 */

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  APP_URL: string;
  COOKIE_NAME: string;
  COOKIE_MAX_AGE: number;
  NODE_ENV: "development" | "production" | "test";
  ADMIN_SECRET: string;
  // Optional integrations — validated in production
  RESEND_API_KEY: string | undefined;
  STRIPE_SECRET_KEY: string | undefined;
  STRIPE_WEBHOOK_SECRET: string | undefined;
  STORAGE_PROVIDER: "local" | "s3" | "r2";
  RATE_LIMIT_AUTH_MAX: number;
  RATE_LIMIT_AUTH_WINDOW: number;
  RATE_LIMIT_API_MAX: number;
  RATE_LIMIT_API_WINDOW: number;
}

type ValidationError = { key: string; reason: string };

function buildDefaults(env: NodeJS.ProcessEnv): EnvConfig {
  const storageVal = env.STORAGE_PROVIDER ?? "local";
  const storage = (["local", "s3", "r2"].includes(storageVal) ? storageVal : "local") as "local" | "s3" | "r2";
  return {
    DATABASE_URL: env.DATABASE_URL ?? "",
    JWT_SECRET: env.JWT_SECRET ?? "build-time-placeholder",
    APP_URL: env.APP_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    COOKIE_NAME: env.COOKIE_NAME ?? "agencyos_session",
    COOKIE_MAX_AGE: parseInt(env.COOKIE_MAX_AGE ?? "604800", 10),
    NODE_ENV: "production",
    ADMIN_SECRET: env.ADMIN_SECRET ?? "build-time-placeholder",
    RESEND_API_KEY: env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    STORAGE_PROVIDER: storage,
    RATE_LIMIT_AUTH_MAX: 10,
    RATE_LIMIT_AUTH_WINDOW: 900,
    RATE_LIMIT_API_MAX: 100,
    RATE_LIMIT_API_WINDOW: 60,
  };
}

function validateEnv(): EnvConfig {
  const errors: ValidationError[] = [];
  const env = process.env;
  const isProd = env.NODE_ENV === "production";
  // Skip validation during Next.js build phase — vars are only needed at runtime
  const isBuildPhase = env.NEXT_PHASE === "phase-production-build";
  if (isBuildPhase) {
    return buildDefaults(env);
  }

  // ─── Always required ───────────────────────────────────────────────────────
  if (!env.DATABASE_URL) errors.push({ key: "DATABASE_URL", reason: "Database connection string is required" });
  if (!env.JWT_SECRET) errors.push({ key: "JWT_SECRET", reason: "JWT signing secret is required" });
  else if (env.JWT_SECRET.length < 32) errors.push({ key: "JWT_SECRET", reason: "Must be at least 32 characters" });
  if (!env.ADMIN_SECRET) errors.push({ key: "ADMIN_SECRET", reason: "Admin secret is required" });
  else if (env.ADMIN_SECRET.length < 16) errors.push({ key: "ADMIN_SECRET", reason: "Must be at least 16 characters" });

  // ─── Production warnings (non-fatal — optional integrations) ─────────────
  if (isProd) {
    const appUrl = env.APP_URL ?? env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) console.warn("[AgencyOS] APP_URL not set — CORS and redirect URLs will use defaults");
    if (!env.RESEND_API_KEY) console.warn("[AgencyOS] RESEND_API_KEY not set — emails will log to console only");
    if (!env.STRIPE_SECRET_KEY) console.warn("[AgencyOS] STRIPE_SECRET_KEY not set — billing features disabled");
    if (!env.STRIPE_WEBHOOK_SECRET) console.warn("[AgencyOS] STRIPE_WEBHOOK_SECRET not set — webhook validation disabled");
  }

  if (errors.length > 0) {
    const lines = errors.map(e => `  ✗ ${e.key}: ${e.reason}`).join("\n");
    const msg = `\n[AgencyOS] Environment validation failed:\n${lines}\n\nSet these variables in your .env file and restart.\n`;
    if (isProd) {
      // In production, crash hard
      console.error(msg);
      process.exit(1);
    } else {
      // In dev, warn but continue
      console.warn(msg);
    }
  }

  const storageVal = env.STORAGE_PROVIDER ?? "local";
  const storage = (["local", "s3", "r2"].includes(storageVal) ? storageVal : "local") as "local" | "s3" | "r2";
  const nodeEnv = (["development", "production", "test"].includes(env.NODE_ENV ?? "") ? env.NODE_ENV : "development") as "development" | "production" | "test";

  return {
    DATABASE_URL: env.DATABASE_URL ?? "",
    JWT_SECRET: env.JWT_SECRET ?? "fallback-dev-secret-minimum-32-chars-long-here",
    APP_URL: env.APP_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    COOKIE_NAME: env.COOKIE_NAME ?? "agencyos_session",
    COOKIE_MAX_AGE: parseInt(env.COOKIE_MAX_AGE ?? "604800", 10),
    NODE_ENV: nodeEnv,
    ADMIN_SECRET: env.ADMIN_SECRET ?? "dev-admin-secret",
    RESEND_API_KEY: env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    STORAGE_PROVIDER: storage,
    RATE_LIMIT_AUTH_MAX: parseInt(env.RATE_LIMIT_AUTH_MAX ?? "10", 10),
    RATE_LIMIT_AUTH_WINDOW: parseInt(env.RATE_LIMIT_AUTH_WINDOW ?? "900", 10),
    RATE_LIMIT_API_MAX: parseInt(env.RATE_LIMIT_API_MAX ?? "100", 10),
    RATE_LIMIT_API_WINDOW: parseInt(env.RATE_LIMIT_API_WINDOW ?? "60", 10),
  };
}

export const config = validateEnv();

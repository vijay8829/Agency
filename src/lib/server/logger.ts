/**
 * Structured JSON logger for production observability.
 * All output is JSON-per-line in production, human-readable in dev.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  traceId?: string;
  userId?: string;
  orgId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  duration?: number;
  status?: number;
  method?: string;
  path?: string;
  ip?: string;
  [key: string]: unknown;
}

const LEVEL_RANKS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel | undefined) ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

function emit(level: LogLevel, message: string, context?: LogContext, err?: unknown): void {
  if (LEVEL_RANKS[level] < LEVEL_RANKS[MIN_LEVEL]) return;

  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    service: "agencyos-api",
    msg: message,
    ...context,
  };

  if (err instanceof Error) {
    entry.error = { name: err.name, message: err.message, stack: process.env.NODE_ENV !== "production" ? err.stack : undefined };
  } else if (err !== undefined) {
    entry.error = String(err);
  }

  if (process.env.NODE_ENV === "production") {
    const out = JSON.stringify(entry);
    level === "error" || level === "warn" ? process.stderr.write(out + "\n") : process.stdout.write(out + "\n");
  } else {
    const color: Record<LogLevel, string> = { debug: "\x1b[90m", info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m" };
    const reset = "\x1b[0m";
    const { ts, level: lvl, service, msg, ...rest } = entry;
    const extras = Object.keys(rest).length ? " " + JSON.stringify(rest) : "";
    const line = `${color[level]}[${String(ts).slice(11, 23)}] ${String(lvl).toUpperCase().padEnd(5)} ${msg}${reset}${extras}`;
    level === "error" || level === "warn" ? console.error(line) : console.log(line);
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext, err?: unknown) => emit("error", msg, ctx, err),

  // Convenience: log an HTTP request completion
  request: (method: string, path: string, status: number, durationMs: number, ctx?: LogContext) =>
    emit(status >= 500 ? "error" : status >= 400 ? "warn" : "info", "HTTP request", { method, path, status, duration: durationMs, ...ctx }),

  // Convenience: log an auth event
  auth: (action: string, success: boolean, ctx?: LogContext) =>
    emit(success ? "info" : "warn", `auth.${action}`, { action: `auth.${action}`, success, ...ctx }),

  // Convenience: log a billing event
  billing: (action: string, ctx?: LogContext) =>
    emit("info", `billing.${action}`, { action: `billing.${action}`, ...ctx }),

  // Convenience: log an AI job event
  ai: (action: string, ctx?: LogContext) =>
    emit("info", `ai.${action}`, { action: `ai.${action}`, ...ctx }),
};

// Generate a short request trace ID
export function newTraceId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

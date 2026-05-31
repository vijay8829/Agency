import { db } from "./db";
import { JWTPayload } from "./auth";

interface AuditOptions {
  action: string;
  resource?: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  severity?: "info" | "warning" | "critical";
}

export async function audit(
  user: JWTPayload,
  opts: AuditOptions,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        organizationId: user.orgId,
        userId: user.sub,
        action: opts.action,
        resource: opts.resource ?? null,
        resourceId: opts.resourceId ?? null,
        oldValue: opts.oldValue ? JSON.stringify(opts.oldValue) : null,
        newValue: opts.newValue ? JSON.stringify(opts.newValue) : null,
        ipAddress: opts.ipAddress ?? null,
        userAgent: opts.userAgent ?? null,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
        severity: opts.severity ?? "info",
      },
    });
  } catch (err) {
    // Audit logging must never crash the main request
    console.error("[Audit] Failed to write log:", err);
  }
}

export async function auditAnon(opts: {
  action: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  severity?: "info" | "warning" | "critical";
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        organizationId: null,
        userId: null,
        action: opts.action,
        ipAddress: opts.ipAddress ?? null,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
        severity: opts.severity ?? "info",
      },
    });
  } catch {
    // never throws
  }
}

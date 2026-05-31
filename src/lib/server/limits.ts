/**
 * Plan limit definitions and enforcement.
 * Single source of truth for all subscription gates.
 */

import { db } from "./db";
import { Err } from "./errors";

export interface PlanConfig {
  id: string;
  name: string;
  price: number;          // monthly price in USD
  yearlyPrice: number;    // yearly price in USD (-1 = custom)
  maxUsers: number;       // -1 = unlimited
  maxClients: number;
  maxLeads: number;
  maxAutomations: number;
  maxAiTasksPerMonth: number;
  maxStorageGb: number;
  maxApiCallsPerDay: number;
  trialDays: number;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    yearlyPrice: 290,
    maxUsers: 3,
    maxClients: 15,
    maxLeads: 150,
    maxAutomations: 5,
    maxAiTasksPerMonth: 50,
    maxStorageGb: 1,
    maxApiCallsPerDay: 500,
    trialDays: 14,
    features: ["3 team members", "15 clients", "50 AI tasks/mo", "5 automations", "1GB storage", "Email support"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 79,
    yearlyPrice: 790,
    maxUsers: 10,
    maxClients: 100,
    maxLeads: 1000,
    maxAutomations: 25,
    maxAiTasksPerMonth: 500,
    maxStorageGb: 10,
    maxApiCallsPerDay: 5000,
    trialDays: 14,
    features: ["10 team members", "100 clients", "500 AI tasks/mo", "25 automations", "10GB storage", "Priority support", "Advanced analytics"],
  },
  agency: {
    id: "agency",
    name: "Agency Pro",
    price: 199,
    yearlyPrice: 1990,
    maxUsers: 25,
    maxClients: 500,
    maxLeads: -1,
    maxAutomations: -1,
    maxAiTasksPerMonth: 2000,
    maxStorageGb: 100,
    maxApiCallsPerDay: 50000,
    trialDays: 14,
    features: ["25 team members", "500 clients", "Unlimited leads", "Unlimited automations", "2000 AI tasks/mo", "100GB storage", "Dedicated support", "White-label"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: -1,
    yearlyPrice: -1,
    maxUsers: -1,
    maxClients: -1,
    maxLeads: -1,
    maxAutomations: -1,
    maxAiTasksPerMonth: -1,
    maxStorageGb: -1,
    maxApiCallsPerDay: -1,
    trialDays: 30,
    features: ["Unlimited everything", "SSO/SAML", "Custom integrations", "SLA guarantee", "Dedicated CSM", "Custom contracts"],
  },
};

export function getPlan(planId: string): PlanConfig {
  return PLANS[planId] ?? PLANS.starter;
}

// ─── Limit enforcement ────────────────────────────────────────────────────────

interface LimitCheckOptions {
  orgId: string;
  resource: "users" | "clients" | "leads" | "automations" | "ai_tasks" | "storage";
  additionalBytes?: number; // for storage checks
}

export async function checkLimit({ orgId, resource, additionalBytes = 0 }: LimitCheckOptions): Promise<void> {
  const subscription = await db.subscription.findFirst({
    where: { organizationId: orgId, status: { in: ["active", "trialing"] } },
    orderBy: { createdAt: "desc" },
  });

  const plan = getPlan(subscription?.plan ?? "starter");

  switch (resource) {
    case "users": {
      if (plan.maxUsers === -1) return;
      const count = await db.membership.count({ where: { organizationId: orgId } });
      if (count >= plan.maxUsers) {
        throw Err.validation(`Your ${plan.name} plan allows up to ${plan.maxUsers} team members. Upgrade to add more.`);
      }
      break;
    }
    case "clients": {
      if (plan.maxClients === -1) return;
      const count = await db.client.count({ where: { organizationId: orgId, deletedAt: null } });
      if (count >= plan.maxClients) {
        throw Err.validation(`Your ${plan.name} plan allows up to ${plan.maxClients} clients. Upgrade to add more.`);
      }
      break;
    }
    case "leads": {
      if (plan.maxLeads === -1) return;
      const count = await db.lead.count({ where: { organizationId: orgId, deletedAt: null } });
      if (count >= plan.maxLeads) {
        throw Err.validation(`Your ${plan.name} plan allows up to ${plan.maxLeads} leads. Upgrade to add more.`);
      }
      break;
    }
    case "automations": {
      if (plan.maxAutomations === -1) return;
      const count = await db.automation.count({ where: { organizationId: orgId, deletedAt: null } });
      if (count >= plan.maxAutomations) {
        throw Err.validation(`Your ${plan.name} plan allows up to ${plan.maxAutomations} automations. Upgrade to add more.`);
      }
      break;
    }
    case "ai_tasks": {
      if (plan.maxAiTasksPerMonth === -1) return;
      const period = new Date().toISOString().slice(0, 7);
      const usage = await db.usageTracking.findFirst({
        where: { organizationId: orgId, metric: "ai_tasks", period },
      });
      if ((usage?.count ?? 0) >= plan.maxAiTasksPerMonth) {
        throw Err.validation(`You've used all ${plan.maxAiTasksPerMonth} AI tasks for this month. Upgrade for more.`);
      }
      break;
    }
    case "storage": {
      if (plan.maxStorageGb === -1) return;
      const limitBytes = plan.maxStorageGb * 1024 * 1024 * 1024;
      const total = await db.file.aggregate({
        where: { organizationId: orgId, deletedAt: null },
        _sum: { sizeBytes: true },
      });
      const usedBytes = (total._sum.sizeBytes ?? 0) + additionalBytes;
      if (usedBytes >= limitBytes) {
        throw Err.validation(`Your ${plan.name} plan includes ${plan.maxStorageGb}GB storage. Upgrade to add more.`);
      }
      break;
    }
  }
}

// ─── Trial helpers ─────────────────────────────────────────────────────────────

export function isTrialing(sub: { status: string; trialEndsAt?: Date | null }): boolean {
  return sub.status === "trialing" && !!sub.trialEndsAt && sub.trialEndsAt > new Date();
}

export function trialDaysRemaining(sub: { trialEndsAt?: Date | null }): number {
  if (!sub.trialEndsAt) return 0;
  return Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

// ─── Coupon validation ─────────────────────────────────────────────────────────

// Static coupon config — in production this would be DB-backed or Stripe coupons
const COUPONS: Record<string, { pct: number; maxUses: number; expiresAt?: Date }> = {
  LAUNCH20: { pct: 20, maxUses: 500 },
  AGENCY30: { pct: 30, maxUses: 100 },
  PARTNER50: { pct: 50, maxUses: 10 },
};

export function validateCoupon(code: string): { valid: boolean; pct?: number; error?: string } {
  const upper = code.toUpperCase().trim();
  const coupon = COUPONS[upper];
  if (!coupon) return { valid: false, error: "Invalid coupon code." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, error: "This coupon has expired." };
  return { valid: true, pct: coupon.pct };
}

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    features: ["5 AI tasks/month", "10 automations", "3 team members", "1GB storage", "Email support"],
    limits: { aiTasks: 5, automations: 10, teamMembers: 3, storageGb: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    interval: "month",
    features: ["100 AI tasks/month", "50 automations", "10 team members", "10GB storage", "Priority support", "Advanced analytics"],
    limits: { aiTasks: 100, automations: 50, teamMembers: 10, storageGb: 10 },
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 149,
    interval: "month",
    features: ["Unlimited AI tasks", "Unlimited automations", "Unlimited team members", "100GB storage", "Dedicated support", "White-label", "Custom integrations"],
    limits: { aiTasks: -1, automations: -1, teamMembers: -1, storageGb: 100 },
  },
];

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const subscription = await db.subscription.findFirst({
      where: { organizationId: user.orgId, status: "active" },
    });
    return ok({ plans: PLANS, currentPlan: subscription?.plan ?? "starter" });
  } catch (err) {
    return errorResponse(err);
  }
}

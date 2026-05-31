import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok, errorResponse } from "@/lib/server/response";
import { apiRateLimit } from "@/lib/server/rate-limit";
import { z } from "zod";

const STEPS = ["company_setup", "team_invited", "integration_connected", "first_lead", "first_client", "first_automation"] as const;
type Step = typeof STEPS[number];

const updateSchema = z.object({
  step: z.enum(STEPS).optional(),
  completed: z.boolean().optional(),
  skip: z.boolean().optional(),
});

async function getOrCreate(orgId: string) {
  return db.onboardingProgress.upsert({
    where: { organizationId: orgId },
    update: {},
    create: { organizationId: orgId, steps: JSON.stringify({}), currentStep: "company_setup" },
  });
}

function computeProgress(stepsJson: string): { steps: Record<Step, boolean>; completedCount: number; totalCount: number; pct: number } {
  const steps = JSON.parse(stepsJson || "{}") as Partial<Record<Step, boolean>>;
  const all = STEPS.reduce<Record<Step, boolean>>((acc, s) => { acc[s] = steps[s] ?? false; return acc; }, {} as Record<Step, boolean>);
  const completedCount = Object.values(all).filter(Boolean).length;
  return { steps: all, completedCount, totalCount: STEPS.length, pct: Math.round((completedCount / STEPS.length) * 100) };
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);
    const progress = await getOrCreate(user.orgId);
    return ok({ ...progress, progress: computeProgress(progress.steps) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    apiRateLimit(user.orgId);

    const data = updateSchema.parse(await req.json());
    const current = await getOrCreate(user.orgId);
    const steps = JSON.parse(current.steps || "{}") as Partial<Record<Step, boolean>>;

    if (data.step) steps[data.step] = data.completed ?? true;

    const allDone = STEPS.every(s => steps[s]);
    const completedAt = allDone && !current.completedAt ? new Date() : current.completedAt;
    const skippedAt = data.skip ? new Date() : current.skippedAt;

    // Advance to next uncompleted step
    const nextStep = STEPS.find(s => !steps[s]) ?? current.currentStep;

    const updated = await db.onboardingProgress.update({
      where: { organizationId: user.orgId },
      data: { steps: JSON.stringify(steps), currentStep: nextStep, completedAt, skippedAt },
    });

    return ok({ ...updated, progress: computeProgress(updated.steps) });
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { logger } from "@/lib/server/logger";
import { emailService } from "@/lib/server/email";

// Stripe webhook signature validation (raw body required)
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts.t;
  const expectedSig = parts.v1;
  if (!timestamp || !expectedSig) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return computed === expectedSig;
}

// Idempotency: track processed event IDs
async function isProcessed(stripeEventId: string): Promise<boolean> {
  const existing = await db.billingEvent.findFirst({ where: { stripeEventId } });
  return !!existing;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      customer?: string;
      metadata?: Record<string, string>;
      status?: string;
      amount_due?: number;
      currency?: string;
      hosted_invoice_url?: string;
      plan?: { id?: string; nickname?: string };
    };
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("billing.webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();

  const valid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!valid) {
    logger.warn("billing.webhook: invalid signature", { signature: signature.slice(0, 20) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(body) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Idempotency check
  if (await isProcessed(event.id)) {
    logger.info("billing.webhook: duplicate event skipped", { eventId: event.id, type: event.type });
    return NextResponse.json({ received: true });
  }

  const obj = event.data.object;
  const customerId = obj.customer;

  // Resolve organization from Stripe customer ID
  const org = customerId
    ? await db.organization.findFirst({ where: { stripeCustomerId: customerId } })
    : null;

  logger.billing("webhook.received", { eventId: event.id, type: event.type, orgId: org?.id });

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        if (org) {
          await db.subscription.updateMany({
            where: { organizationId: org.id },
            data: { status: "active" },
          });
          await db.billingEvent.create({
            data: {
              organizationId: org.id,
              type: "payment_succeeded",
              amount: obj.amount_due,
              currency: obj.currency ?? "usd",
              description: "Payment succeeded",
              stripeEventId: event.id,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        if (org) {
          await db.subscription.updateMany({
            where: { organizationId: org.id },
            data: { status: "past_due" },
          });
          await db.billingEvent.create({
            data: {
              organizationId: org.id,
              type: "payment_failed",
              amount: obj.amount_due,
              currency: obj.currency ?? "usd",
              description: "Payment failed",
              stripeEventId: event.id,
              metadata: JSON.stringify({ invoiceUrl: obj.hosted_invoice_url }),
            },
          });

          // Notify owner
          const owner = await db.user.findFirst({ where: { organizationId: org.id, role: "owner" } });
          if (owner) {
            const amount = obj.amount_due ? `$${(obj.amount_due / 100).toFixed(2)}` : "unknown";
            await emailService.sendPaymentFailed(
              owner.email,
              owner.name,
              amount,
              `${process.env.APP_URL ?? ""}/app?module=billing`
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        if (org && obj.plan?.nickname) {
          await db.subscription.updateMany({
            where: { organizationId: org.id },
            data: { plan: obj.plan.nickname.toLowerCase(), status: obj.status ?? "active" },
          });
          await db.billingEvent.create({
            data: {
              organizationId: org.id,
              type: "plan_change",
              description: `Plan updated to ${obj.plan.nickname}`,
              stripeEventId: event.id,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        if (org) {
          await db.subscription.updateMany({
            where: { organizationId: org.id },
            data: { status: "cancelled" },
          });
          await db.billingEvent.create({
            data: {
              organizationId: org.id,
              type: "subscription_cancelled",
              description: "Subscription cancelled",
              stripeEventId: event.id,
            },
          });
        }
        break;
      }

      default:
        logger.info("billing.webhook: unhandled event type", { type: event.type });
    }
  } catch (err) {
    logger.error("billing.webhook: processing error", { eventId: event.id, type: event.type }, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

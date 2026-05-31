import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  const passwordHash = await hash("Demo1234!", 12);

  const org = await db.organization.upsert({
    where: { slug: "acme-agency-demo" },
    update: {},
    create: { name: "Acme Agency", slug: "acme-agency-demo", plan: "pro" },
  });

  const owner = await db.user.upsert({
    where: { email: "demo@acme.agency" },
    update: {},
    create: {
      email: "demo@acme.agency",
      name: "Jane Smith",
      passwordHash,
      role: "owner",
      organizationId: org.id,
      emailVerified: true,
    },
  });

  await db.membership.upsert({
    where: { userId_organizationId: { userId: owner.id, organizationId: org.id } },
    update: {},
    create: { userId: owner.id, organizationId: org.id, role: "owner" },
  });

  await db.settings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      ownerName: "Jane Smith",
      ownerEmail: "demo@acme.agency",
      timezone: "America/New_York",
      aiStyle: "Professional",
      aiModel: "GPT-4 Turbo",
      autoQualify: true,
      emailSummary: false,
      meetingRecap: true,
    },
  });

  await db.subscription.upsert({
    where: { stripeSubId: "demo_sub_001" },
    update: {},
    create: {
      organizationId: org.id,
      plan: "pro",
      status: "active",
      stripeSubId: "demo_sub_001",
    },
  });

  // Seed leads
  const leadData = [
    { name: "Marcus Rivera", company: "TechFlow Inc", email: "marcus@techflow.io", value: "$12,000", status: "hot", source: "Referral", phone: "+1 555-0101" },
    { name: "Sarah Chen", company: "Meridian Group", email: "schen@meridian.co", value: "$8,500", status: "warm", source: "LinkedIn", phone: "+1 555-0102" },
    { name: "Derek Walsh", company: "Pinnacle Labs", email: "derek@pinnaclelabs.com", value: "$22,000", status: "cold", source: "Cold Outreach", phone: "+1 555-0103" },
    { name: "Aisha Johnson", company: "Orbit Digital", email: "aisha@orbitdigital.com", value: "$6,200", status: "hot", source: "Conference" },
    { name: "Tom Bradley", company: "Vertex Solutions", email: "tom@vertexsol.com", value: "$15,000", status: "warm", source: "Website" },
  ];

  for (const lead of leadData) {
    await db.lead.create({ data: { ...lead, organizationId: org.id, createdById: owner.id } });
  }

  // Seed clients
  const clientData = [
    { name: "Meridian Group", contact: "Sarah Chen", email: "schen@meridian.co", project: "Brand Refresh 2024", status: "active", health: 92, nextTask: "Send Q4 report" },
    { name: "TechFlow Inc", contact: "Marcus Rivera", email: "marcus@techflow.io", project: "Social Media Strategy", status: "at-risk", health: 61, nextTask: "Schedule review call" },
    { name: "Vertex Solutions", contact: "Tom Bradley", email: "tom@vertexsol.com", project: "SEO + Content", status: "active", health: 85, nextTask: "Deliver content batch" },
    { name: "Orbit Digital", contact: "Aisha Johnson", email: "aisha@orbitdigital.com", project: "PPC Campaign", status: "paused", health: 78, nextTask: "Resume after budget approval" },
  ];

  for (const client of clientData) {
    await db.client.create({ data: { ...client, organizationId: org.id, createdById: owner.id } });
  }

  // Seed automations
  const autoData = [
    { name: "Lead Follow-up Sequence", trigger: "New lead added", status: "active" },
    { name: "Invoice Reminder", trigger: "Invoice 3 days overdue", status: "active" },
    { name: "Weekly Report Generator", trigger: "Every Monday 9am", status: "paused" },
    { name: "Client Health Alert", trigger: "Health score < 70", status: "active" },
  ];

  for (const a of autoData) {
    await db.automation.create({ data: { ...a, organizationId: org.id, createdById: owner.id } });
  }

  // Seed notifications
  const notifData = [
    { type: "lead", title: "New hot lead: Marcus Rivera", body: "TechFlow Inc — $12,000 opportunity from Referral", read: false },
    { type: "invoice", title: "Invoice overdue: Meridian Group", body: "#INV-2024-041 for $4,800 is 3 days overdue", read: false },
    { type: "ai", title: "AI Employee completed follow-up", body: "Drafted 3 follow-up emails for cold leads", read: false },
    { type: "client", title: "Client health dropped: TechFlow", body: "Health score fell to 61 — review recommended", read: true },
    { type: "system", title: "Weekly report ready", body: "Your Week 21 performance report is available", read: true },
  ];

  for (const n of notifData) {
    await db.notification.create({ data: { ...n, organizationId: org.id, userId: owner.id } });
  }

  console.log("✓ Seed complete.");
  console.log(`  Org:   ${org.name} (${org.id})`);
  console.log(`  Login: demo@acme.agency / Demo1234!`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });

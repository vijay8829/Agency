import { z } from "zod";

// ─── Auth schemas ──────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  organizationName: z.string().min(2, "Agency name must be at least 2 characters").max(80),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

// ─── Lead schemas ──────────────────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  company: z.string().min(1, "Company is required").max(100).trim(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  value: z.string().max(30).optional(),
  status: z.enum(["hot", "warm", "cold"]).default("warm"),
  source: z.string().max(60).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

// ─── Client schemas ────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100).trim(),
  contact: z.string().min(1, "Contact name is required").max(100).trim(),
  email: z.string().email().optional().or(z.literal("")),
  project: z.string().max(200).optional(),
  status: z.enum(["active", "at-risk", "churned", "paused"]).default("active"),
  health: z.number().int().min(0).max(100).default(80),
  nextTask: z.string().max(200).optional(),
  dueDate: z.string().max(60).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ─── Invoice schemas ───────────────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
  client: z.string().min(1, "Client is required").max(100).trim(),
  clientId: z.string().optional(),
  project: z.string().max(200).optional(),
  amount: z.string().min(1, "Amount is required").max(30).trim(),
  status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]).default("pending"),
  dueDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// ─── Automation schemas ────────────────────────────────────────────────────────

export const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  trigger: z.string().min(1, "Trigger is required").max(200).trim(),
  status: z.enum(["active", "paused"]).default("paused"),
  definition: z.string().optional(),
});

export const updateAutomationSchema = createAutomationSchema.partial();

// ─── Notification schemas ──────────────────────────────────────────────────────

export const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

// ─── Team schemas ──────────────────────────────────────────────────────────────

export const inviteMemberSchema = z.object({
  name: z.string().min(1).max(80).trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  role: z.enum(["admin", "manager", "member", "viewer"]).default("member"),
});

export const updateMemberSchema = z.object({
  role: z.enum(["admin", "manager", "member", "viewer"]),
});

// ─── Settings schemas ──────────────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
  ownerName: z.string().max(80).optional(),
  ownerEmail: z.string().email().optional(),
  timezone: z.string().max(60).optional(),
  aiStyle: z.enum(["Professional", "Casual", "Concise"]).optional(),
  aiModel: z.enum(["GPT-4 Turbo", "GPT-4o", "Claude 3.5"]).optional(),
  autoQualify: z.boolean().optional(),
  emailSummary: z.boolean().optional(),
  meetingRecap: z.boolean().optional(),
});

// ─── Content schemas ───────────────────────────────────────────────────────────

export const createContentSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  client: z.string().min(1).max(100).trim(),
  type: z.string().max(60),
  status: z.enum(["draft", "review", "ready"]).default("draft"),
  body: z.string().max(50000).optional(),
});

export const updateContentSchema = createContentSchema.partial();

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

"use client";

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number, public readonly details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });

  const json = await res.json().catch(() => ({ success: false, error: "Invalid response" }));

  if (!res.ok || !json.success) {
    throw new ApiError(json.code ?? "UNKNOWN", json.error ?? "An error occurred", res.status, json.details);
  }

  return json.data as T;
}

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const auth = {
  signup: (body: { name: string; email: string; password: string; organizationName: string }) =>
    request<{ user: User; organization: Org }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User; organization: Org }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User; organization: Org }>("/auth/me"),
};

// ─── Leads ──────────────────────────────────────────────────────────────────

export const leads = {
  list: (params?: ListParams) => request<Paginated<Lead>>(`/leads${buildQuery(params ?? {})}`),
  get: (id: string) => request<Lead>(`/leads/${id}`),
  create: (body: Partial<Lead>) => request<Lead>("/leads", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Lead>) => request<Lead>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`/api/leads/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Clients ─────────────────────────────────────────────────────────────────

export const clients = {
  list: (params?: ListParams) => request<Paginated<Client>>(`/clients${buildQuery(params ?? {})}`),
  get: (id: string) => request<Client>(`/clients/${id}`),
  create: (body: Partial<Client>) => request<Client>("/clients", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Client>) => request<Client>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`/api/clients/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Invoices ────────────────────────────────────────────────────────────────

export const invoices = {
  list: (params?: ListParams) => request<Paginated<Invoice>>(`/invoices${buildQuery(params ?? {})}`),
  get: (id: string) => request<Invoice>(`/invoices/${id}`),
  create: (body: Partial<Invoice>) => request<Invoice>("/invoices", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Invoice>) => request<Invoice>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`/api/invoices/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Automations ─────────────────────────────────────────────────────────────

export const automations = {
  list: (params?: ListParams) => request<Paginated<Automation>>(`/automations${buildQuery(params ?? {})}`),
  get: (id: string) => request<Automation>(`/automations/${id}`),
  create: (body: Partial<Automation>) => request<Automation>("/automations", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Automation>) => request<Automation>(`/automations/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`/api/automations/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = {
  list: (params?: ListParams) => request<Paginated<Notification>>(`/notifications${buildQuery(params ?? {})}`),
  markRead: (id: string) => request<Notification>(`/notifications/${id}`, { method: "PATCH", body: JSON.stringify({ read: true }) }),
  markAllRead: () => request<{ message: string }>("/notifications", { method: "PATCH" }),
  delete: (id: string) => fetch(`/api/notifications/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
  deleteAll: () => fetch("/api/notifications", { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Team ─────────────────────────────────────────────────────────────────────

export const team = {
  list: () => request<TeamMember[]>("/team"),
  invite: (body: { name: string; email: string; role: string }) => request<TeamMember>("/team", { method: "POST", body: JSON.stringify(body) }),
  updateRole: (id: string, role: string) => request<unknown>(`/team/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }),
  remove: (id: string) => fetch(`/api/team/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settings = {
  get: () => request<OrgSettings>("/settings"),
  update: (body: Partial<OrgSettings>) => request<OrgSettings>("/settings", { method: "PATCH", body: JSON.stringify(body) }),
};

// ─── Content ─────────────────────────────────────────────────────────────────

export const content = {
  list: (params?: ListParams) => request<Paginated<ContentItem>>(`/content${buildQuery(params ?? {})}`),
  get: (id: string) => request<ContentItem>(`/content/${id}`),
  create: (body: Partial<ContentItem>) => request<ContentItem>("/content", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<ContentItem>) => request<ContentItem>(`/content/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`/api/content/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.status === 204 ? null : r.json()),
};

// ─── Billing ──────────────────────────────────────────────────────────────────

export const billing = {
  plans: () => request<{ plans: Plan[]; currentPlan: string }>("/billing/plans"),
  subscription: () => request<unknown>("/billing/subscription"),
  changePlan: (plan: string) => request<unknown>("/billing/subscription", { method: "POST", body: JSON.stringify({ plan }) }),
};

// ─── AI Jobs ─────────────────────────────────────────────────────────────────

export const aiJobs = {
  list: (params?: ListParams) => request<Paginated<AiJob>>(`/ai/jobs${buildQuery(params ?? {})}`),
  get: (id: string) => request<AiJob>(`/ai/jobs/${id}`),
  create: (body: { type: string; prompt: string; model?: string; priority?: string }) => request<AiJob>("/ai/jobs", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User { id: string; email: string; name: string; role: string; avatarUrl?: string | null; lastLoginAt?: string | null; createdAt?: string; }
export interface Org { id: string; name: string; slug: string; plan?: string; }
export interface Lead { id: string; name: string; company: string; email?: string; phone?: string; value?: string; status: string; source?: string; notes?: string; createdAt: string; }
export interface Client { id: string; name: string; contact: string; email?: string; project?: string; status: string; health: number; nextTask?: string; dueDate?: string; notes?: string; createdAt: string; }
export interface Invoice { id: string; client: string; clientId?: string; project?: string; amount: string; status: string; dueDate?: string; notes?: string; createdAt: string; }
export interface Automation { id: string; name: string; trigger: string; status: string; definition?: string; createdAt: string; }
export interface Notification { id: string; type: string; title: string; body?: string; read: boolean; createdAt: string; }
export interface TeamMember { id: string; email: string; name: string; role: string; memberId: string; avatarUrl?: string | null; lastLoginAt?: string | null; }
export interface OrgSettings { ownerName?: string; ownerEmail?: string; timezone?: string; aiStyle?: string; aiModel?: string; autoQualify?: boolean; emailSummary?: boolean; meetingRecap?: boolean; }
export interface ContentItem { id: string; title: string; client: string; type: string; status: string; body?: string; createdAt: string; }
export interface Plan { id: string; name: string; price: number; interval: string; features: string[]; popular?: boolean; }
export interface AiJob { id: string; type: string; prompt: string; status: string; result?: string; error?: string; priority: string; createdAt: string; }
export interface Paginated<T> { items: T[]; pagination: { total: number; page: number; pageSize: number; totalPages: number; hasMore: boolean; }; }
export interface ListParams { page?: number; limit?: number; search?: string; sort?: string; order?: "asc" | "desc"; [key: string]: unknown; }

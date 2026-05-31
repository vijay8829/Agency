export const metrics = {
  leadsToday: 12,
  unpaidInvoices: 4,
  clientTasks: 23,
  activeAutomations: 7,
  pendingFollowUps: 9,
  completedThisWeek: 47,
};

export const leads = [
  { id: "1", name: "Sarah Chen", company: "Pinnacle Digital", status: "warm", value: "$8,500", lastContact: "2h ago", email: "sarah@pinnacle.io" },
  { id: "2", name: "Marcus Rivera", company: "Grow Media Co.", status: "hot", value: "$14,200", lastContact: "5h ago", email: "m.rivera@growmedia.com" },
  { id: "3", name: "Priya Patel", company: "Bloom Agency", status: "cold", value: "$3,200", lastContact: "2d ago", email: "priya@bloomagency.co" },
  { id: "4", name: "Jordan Lee", company: "Flux Creative", status: "warm", value: "$6,800", lastContact: "1d ago", email: "jordan@fluxcreative.io" },
  { id: "5", name: "Alex Thompson", company: "NextWave Studios", status: "hot", value: "$22,000", lastContact: "30m ago", email: "alex@nextwavest.com" },
];

export const clients = [
  { id: "1", name: "Apex Digital", contact: "Tom Wright", project: "Brand Refresh", status: "active", health: 90, nextTask: "Design review call", dueDate: "Tomorrow" },
  { id: "2", name: "Meridian Group", contact: "Lisa Park", project: "SEO Campaign", status: "at-risk", health: 45, nextTask: "Send progress report", dueDate: "Today" },
  { id: "3", name: "Vanta Labs", contact: "James Osei", project: "Website Redesign", status: "active", health: 78, nextTask: "Deliver wireframes", dueDate: "Fri" },
  { id: "4", name: "Nova Commerce", contact: "Emma Walsh", project: "Social Media", status: "active", health: 95, nextTask: "Monthly report", dueDate: "Next Mon" },
];

export const invoices = [
  { id: "INV-2024-089", client: "Apex Digital", amount: "$4,500", status: "overdue", daysOverdue: 12, project: "Brand Refresh Phase 2" },
  { id: "INV-2024-091", client: "Meridian Group", amount: "$2,800", status: "pending", daysOverdue: 3, project: "SEO Campaign" },
  { id: "INV-2024-094", client: "Nova Commerce", amount: "$1,200", status: "pending", daysOverdue: 0, project: "Social Media Mgmt" },
  { id: "INV-2024-096", client: "Vanta Labs", amount: "$8,750", status: "overdue", daysOverdue: 7, project: "Website Redesign" },
];

export const automations = [
  { id: "1", name: "Lead Follow-Up Sequence", trigger: "New lead added", status: "active", runs: 142, lastRun: "2m ago" },
  { id: "2", name: "Invoice Reminder", trigger: "Invoice overdue 7 days", status: "active", runs: 38, lastRun: "1h ago" },
  { id: "3", name: "Client Weekly Update", trigger: "Every Monday 9am", status: "active", runs: 24, lastRun: "3d ago" },
  { id: "4", name: "Meeting Recap Generator", trigger: "Meeting ends", status: "paused", runs: 67, lastRun: "1d ago" },
  { id: "5", name: "Social Post Scheduler", trigger: "Content approved", status: "active", runs: 89, lastRun: "4h ago" },
];

export const recentActivity = [
  { id: "1", type: "ai", message: "Drafted follow-up email to Marcus Rivera (Grow Media Co.)", time: "2m ago", icon: "bot" },
  { id: "2", type: "invoice", message: "Payment reminder sent to Apex Digital — $4,500 overdue", time: "1h ago", icon: "invoice" },
  { id: "3", type: "client", message: "Weekly status report generated for Nova Commerce", time: "3h ago", icon: "report" },
  { id: "4", type: "lead", message: "New lead qualified: Alex Thompson @ NextWave Studios ($22k)", time: "30m ago", icon: "lead" },
  { id: "5", type: "content", message: "5 social posts scheduled for next week's campaign", time: "4h ago", icon: "content" },
];

export const contentItems = [
  { id: "1", title: "Brand awareness campaign — 10 LinkedIn posts", type: "Social Media", status: "ready", client: "Apex Digital" },
  { id: "2", title: "Email newsletter — October digest", type: "Email", status: "draft", client: "Meridian Group" },
  { id: "3", title: "Landing page copy — Product launch", type: "Web Copy", status: "review", client: "Vanta Labs" },
  { id: "4", title: "Q4 content calendar", type: "Planning", status: "ready", client: "Nova Commerce" },
];

export const aiSuggestions = [
  "Follow up with warm leads from this week",
  "Generate weekly business summary",
  "Draft payment reminders for overdue invoices",
  "Create social media posts for Apex Digital",
  "Summarize all client project statuses",
  "Schedule meeting recaps for this week",
];

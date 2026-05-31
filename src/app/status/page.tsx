"use client";

import { useEffect, useState } from "react";

type ComponentStatus = "operational" | "degraded" | "outage";

interface StatusData {
  status: ComponentStatus;
  updatedAt: string;
  components: {
    api: { status: ComponentStatus; latencyMs: number };
    database: { status: ComponentStatus; latencyMs: number };
    queue: { status: ComponentStatus; depth: number };
  };
  metrics: { openSupportTickets: number };
  incidents: { title: string; status: string; createdAt: string }[];
}

const STATUS_COLORS: Record<ComponentStatus, string> = {
  operational: "text-green-400",
  degraded: "text-yellow-400",
  outage: "text-red-400",
};

const STATUS_BG: Record<ComponentStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  outage: "bg-red-500",
};

const STATUS_LABELS: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
};

function StatusBadge({ status }: { status: ComponentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      <span className={`w-2 h-2 rounded-full ${STATUS_BG[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(setData)
      .catch(() => setError("Could not load status."))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetch("/api/status").then(r => r.json()).then(setData).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">System Status</h1>
        <p className="text-zinc-400 text-sm">Real-time status of all AgencyOS services.</p>
      </div>

      {loading && (
        <div className="text-zinc-400 text-sm">Loading status...</div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">{error}</div>
      )}

      {data && (
        <>
          <div className={`rounded-xl p-6 mb-8 border ${
            data.status === "operational" ? "bg-green-950/30 border-green-800" :
            data.status === "degraded" ? "bg-yellow-950/30 border-yellow-800" :
            "bg-red-950/30 border-red-800"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xl font-semibold mb-1 ${STATUS_COLORS[data.status]}`}>
                  {data.status === "operational" ? "All Systems Operational" :
                   data.status === "degraded" ? "Partial Service Disruption" :
                   "Service Outage"}
                </div>
                <div className="text-zinc-400 text-xs">
                  Last updated: {new Date(data.updatedAt).toLocaleTimeString()}
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full ${STATUS_BG[data.status]}`} />
            </div>
          </div>

          <div className="space-y-2 mb-10">
            {Object.entries(data.components).map(([key, comp]) => (
              <div key={key} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                <span className="text-sm font-medium capitalize">{key}</span>
                <div className="flex items-center gap-4">
                  {"latencyMs" in comp && (
                    <span className="text-xs text-zinc-500">{comp.latencyMs}ms</span>
                  )}
                  {"depth" in comp && comp.depth > 0 && (
                    <span className="text-xs text-zinc-500">{comp.depth} queued</span>
                  )}
                  <StatusBadge status={comp.status} />
                </div>
              </div>
            ))}
          </div>

          {data.incidents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">Active Incidents</h2>
              <div className="space-y-2">
                {data.incidents.map((inc, i) => (
                  <div key={i} className="bg-yellow-950/20 border border-yellow-800 rounded-lg px-4 py-3">
                    <div className="text-sm font-medium text-yellow-300">{inc.title}</div>
                    <div className="text-xs text-zinc-400 mt-1">{new Date(inc.createdAt).toLocaleString()} · {inc.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.incidents.length === 0 && (
            <p className="text-xs text-zinc-500 text-center">No active incidents.</p>
          )}
        </>
      )}
    </main>
  );
}

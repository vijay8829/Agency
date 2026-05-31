export type ThemeMode = "dark" | "light" | "system";

const KEY = "agencyos_theme";

const DARK_VARS: Record<string, string> = {
  "--clr-text1":        "#f1f1f3",
  "--clr-text2":        "#a1a1aa",
  "--clr-text3":        "#71717a",
  "--clr-text4":        "#52525b",
  "--clr-border":       "rgba(255,255,255,0.07)",
  "--clr-border-hover": "rgba(255,255,255,0.12)",
  "--clr-card":         "rgba(255,255,255,0.026)",
  "--clr-card-hover":   "rgba(255,255,255,0.044)",
  "--clr-input-bg":     "rgba(255,255,255,0.03)",
  "--clr-input-border": "rgba(255,255,255,0.08)",
  "--app-bg":           "#080c18",
  "--app-header-bg":    "rgba(10,14,28,0.94)",
  "--app-header-border":"rgba(255,255,255,0.055)",
  "--clr-panel-bg":     "#0d1120",
  "--sidebar-bg":       "#080c18",
  "--sidebar-hover":    "rgba(255,255,255,0.05)",
  "--sidebar-border":   "rgba(255,255,255,0.05)",
  "--sidebar-text":     "#71717a",
  "--sidebar-text-active": "#c4b5fd",
};

const LIGHT_VARS: Record<string, string> = {
  "--clr-text1":        "#111827",
  "--clr-text2":        "#374151",
  "--clr-text3":        "#6b7280",
  "--clr-text4":        "#9ca3af",
  "--clr-border":       "rgba(0,0,0,0.08)",
  "--clr-border-hover": "rgba(0,0,0,0.14)",
  "--clr-card":         "rgba(255,255,255,0.88)",
  "--clr-card-hover":   "rgba(255,255,255,0.98)",
  "--clr-input-bg":     "#ffffff",
  "--clr-input-border": "rgba(0,0,0,0.12)",
  "--app-bg":           "#f0f3fa",
  "--app-header-bg":    "rgba(240,243,250,0.95)",
  "--app-header-border":"rgba(0,0,0,0.08)",
  "--clr-panel-bg":     "#ffffff",
  "--sidebar-bg":       "#f5f7fb",
  "--sidebar-hover":    "rgba(0,0,0,0.04)",
  "--sidebar-border":   "rgba(0,0,0,0.07)",
  "--sidebar-text":     "#6b7280",
  "--sidebar-text-active": "#7c3aed",
};

function applyVars(vars: Record<string, string>) {
  const style = document.documentElement.style;
  Object.entries(vars).forEach(([prop, val]) => style.setProperty(prop, val));
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  let resolved: "dark" | "light" = "dark";
  if (mode === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } else {
    resolved = mode;
  }
  root.setAttribute("data-theme", resolved);
  applyVars(resolved === "light" ? LIGHT_VARS : DARK_VARS);
  localStorage.setItem(KEY, mode);
}

export function getSavedTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(KEY) as ThemeMode) || "dark";
}

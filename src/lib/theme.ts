export type ThemeMode = "dark" | "light" | "system";

const KEY = "agencyos_theme";

const DARK_VARS: Record<string, string> = {
  "--clr-text1":           "#e4f0fc",
  "--clr-text2":           "#7aa5c2",
  "--clr-text3":           "#4d7a94",
  "--clr-text4":           "#2d5268",
  "--clr-border":          "rgba(0,212,255,0.09)",
  "--clr-border-hover":    "rgba(0,212,255,0.20)",
  "--clr-card":            "rgba(0,212,255,0.03)",
  "--clr-card-hover":      "rgba(0,212,255,0.06)",
  "--clr-input-bg":        "rgba(0,212,255,0.03)",
  "--clr-input-border":    "rgba(0,212,255,0.12)",
  "--app-bg":              "#020510",
  "--app-header-bg":       "rgba(2,5,16,0.92)",
  "--app-header-border":   "rgba(0,212,255,0.08)",
  "--clr-panel-bg":        "#050d22",
  "--sidebar-bg":          "#030814",
  "--sidebar-hover":       "rgba(0,212,255,0.05)",
  "--sidebar-border":      "rgba(0,212,255,0.07)",
  "--sidebar-text":        "#3d5a72",
  "--sidebar-text-active": "#00d4ff",
};

const LIGHT_VARS: Record<string, string> = {
  "--clr-text1":           "#0f1b2a",
  "--clr-text2":           "#1e3a52",
  "--clr-text3":           "#4a6a82",
  "--clr-text4":           "#7a9ab2",
  "--clr-border":          "rgba(0,100,150,0.10)",
  "--clr-border-hover":    "rgba(0,100,150,0.18)",
  "--clr-card":            "rgba(255,255,255,0.92)",
  "--clr-card-hover":      "rgba(255,255,255,0.99)",
  "--clr-input-bg":        "#ffffff",
  "--clr-input-border":    "rgba(0,100,150,0.14)",
  "--app-bg":              "#eef4fb",
  "--app-header-bg":       "rgba(238,244,251,0.96)",
  "--app-header-border":   "rgba(0,100,150,0.10)",
  "--clr-panel-bg":        "#ffffff",
  "--sidebar-bg":          "#030814",
  "--sidebar-hover":       "rgba(0,212,255,0.05)",
  "--sidebar-border":      "rgba(0,212,255,0.07)",
  "--sidebar-text":        "#3d5a72",
  "--sidebar-text-active": "#00d4ff",
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

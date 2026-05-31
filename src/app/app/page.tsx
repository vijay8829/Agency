"use client";
import { useState, useEffect } from "react";
import { applyTheme, getSavedTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Onboarding } from "@/components/Onboarding";
import { Dashboard } from "@/components/modules/Dashboard";
import { Leads } from "@/components/modules/Leads";
import { Clients } from "@/components/modules/Clients";
import { Content } from "@/components/modules/Content";
import { Operations } from "@/components/modules/Operations";
import { Automations } from "@/components/modules/Automations";
import { Reports } from "@/components/modules/Reports";
import { Assistant } from "@/components/modules/Assistant";
import { Settings } from "@/components/modules/Settings";
import { HealthScore } from "@/components/modules/HealthScore";
import { Billing } from "@/components/modules/Billing";
import { Team } from "@/components/modules/Team";
import { Notifications } from "@/components/modules/Notifications";
import { Integrations } from "@/components/modules/Integrations";
import { ToastContainer } from "@/components/ui/ToastContainer";

const ONBOARDING_KEY = "agencyos_onboarded_v1";
const SIDEBAR_W = 220;

const MODULES: Record<string, React.ReactNode> = {
  dashboard:   <Dashboard />,
  leads:       <Leads />,
  clients:     <Clients />,
  content:     <Content />,
  operations:  <Operations />,
  automations: <Automations />,
  reports:     <Reports />,
  assistant:   <Assistant />,
  settings:       <Settings />,
  health:         <HealthScore />,
  billing:        <Billing />,
  team:           <Team />,
  notifications:  <Notifications />,
  integrations:   <Integrations />,
};

export default function AppPage() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
    applyTheme(getSavedTheme());
  }, []);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavigate = (id: string) => {
    setActiveModule(id);
    setSidebarOpen(false);
  };

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  const isChat = activeModule === "assistant";

  return (
    <div className="app-root h-full flex">
      <Sidebar
        activeModule={activeModule}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className="flex flex-col min-h-full"
        style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, flex: 1, overflow: "hidden", minWidth: 0 }}
      >
        <Header
          activeModule={activeModule}
          onNavigate={handleNavigate}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main
          className="flex-1 app-main"
          style={isChat ? { display: "flex", flexDirection: "column", overflow: "hidden" } : { overflowY: "auto" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={isChat ? { display: "flex", flexDirection: "column", flex: 1, height: "100%" } : {}}
            >
              {MODULES[activeModule]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Onboarding overlay */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onDismiss={dismissOnboarding} />}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | AgencyOS",
  description: "Your AgencyOS workspace — manage leads, clients, invoices, automations, and more.",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

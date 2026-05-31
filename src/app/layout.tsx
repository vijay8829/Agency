import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "AgencyOS — AI Employee for Agencies",
    template: "%s | AgencyOS",
  },
  description:
    "The AI-powered business operating system for digital agencies. Manage leads, clients, invoices, and automations — with an AI employee that works 24/7.",
  keywords: [
    "agency management software",
    "AI employee",
    "agency CRM",
    "client management",
    "lead pipeline",
    "invoice management",
    "marketing agency tools",
    "AI automation",
  ],
  authors: [{ name: "AgencyOS" }],
  creator: "AgencyOS",
  metadataBase: new URL("https://agencyos.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agencyos.ai",
    siteName: "AgencyOS",
    title: "AgencyOS — AI Employee for Agencies",
    description:
      "The AI-powered business operating system for digital agencies. Leads, clients, invoices, and automations — all with an AI employee that works 24/7.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgencyOS — AI Employee for Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgencyOS — AI Employee for Agencies",
    description:
      "The AI-powered business operating system for digital agencies.",
    images: ["/og-image.png"],
    creator: "@agencyos",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Anti-flash: apply saved theme before React hydration */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('agencyos_theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);if(r==='light'){var v={'--clr-text1':'#111827','--clr-text2':'#374151','--clr-text3':'#6b7280','--clr-text4':'#9ca3af','--clr-border':'rgba(0,0,0,0.08)','--clr-border-hover':'rgba(0,0,0,0.14)','--clr-card':'rgba(255,255,255,0.88)','--clr-card-hover':'rgba(255,255,255,0.98)','--clr-input-bg':'#ffffff','--clr-input-border':'rgba(0,0,0,0.12)','--app-bg':'#f0f3fa','--app-header-bg':'rgba(240,243,250,0.95)','--app-header-border':'rgba(0,0,0,0.08)','--clr-panel-bg':'#ffffff','--sidebar-bg':'#f5f7fb','--sidebar-hover':'rgba(0,0,0,0.04)','--sidebar-border':'rgba(0,0,0,0.07)','--sidebar-text':'#6b7280','--sidebar-text-active':'#7c3aed'};var s=document.documentElement.style;Object.keys(v).forEach(function(k){s.setProperty(k,v[k]);});}}catch(e){}})();` }} />
      </head>
      <body className="h-full antialiased">
        <ChunkErrorRecovery />
        {children}
      </body>
    </html>
  );
}

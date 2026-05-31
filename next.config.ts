import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Explicit allowed origins — never wildcard tunnel URLs
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? APP_URL)
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);


const CSP = [
  "default-src 'self'",
  // Next.js dev mode needs unsafe-eval for hot reload; locked down in prod
  `script-src 'self'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : " 'unsafe-inline'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self'${isDev ? " ws://localhost:* wss://localhost:* http://localhost:* wss://*.trycloudflare.com https://*.trycloudflare.com" : ""}`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isDev ? [] : [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ]),
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  // Next.js 15+ dev security: allow HMR WebSocket from any trycloudflare subdomain.
  // The wildcard *.trycloudflare.com matches any rotating free-tunnel hostname.
  ...(isDev ? { allowedDevOrigins: ["*.trycloudflare.com"] } : {}),

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: ALLOWED_ORIGINS[0] ?? APP_URL },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Request-ID" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/prisma/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

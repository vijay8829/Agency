import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#050509", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: "rgba(124,58,237,0.1)", letterSpacing: "-0.04em", lineHeight: 1 }}>404</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#52525b" }}>Page not found</div>
      <p style={{ fontSize: 13, color: "#3f3f46", maxWidth: 260, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: "#a78bfa", textDecoration: "none", padding: "8px 20px", border: "1px solid rgba(124,58,237,0.28)", borderRadius: 10, background: "rgba(124,58,237,0.08)" }}
      >
        Go home
      </Link>
    </div>
  );
}

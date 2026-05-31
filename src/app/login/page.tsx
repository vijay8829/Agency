"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login({ email, password });
      router.push("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-bg)", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--clr-text)", marginBottom: 8 }}>AgencyOS</div>
          <p style={{ color: "var(--clr-text-muted)", fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "0.75rem 1rem", color: "#f87171", fontSize: 14 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--clr-text)", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@agency.com"
                style={{ width: "100%", background: "var(--clr-input-bg)", border: "1px solid var(--clr-input-border)", borderRadius: 8, padding: "0.625rem 0.875rem", color: "var(--clr-text)", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--clr-text)" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--clr-accent)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: "100%", background: "var(--clr-input-bg)", border: "1px solid var(--clr-input-border)", borderRadius: 8, padding: "0.625rem 0.875rem", color: "var(--clr-text)", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "var(--clr-card-hover)" : "var(--clr-accent)", color: "#fff", border: "none", borderRadius: 8, padding: "0.75rem", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, transition: "opacity 0.2s", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "var(--clr-text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--clr-accent)", textDecoration: "none", fontWeight: 500 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

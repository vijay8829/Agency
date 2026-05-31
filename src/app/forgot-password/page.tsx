"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
// auth import reserved for future use

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Request failed.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-bg)", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--clr-text)", marginBottom: 8 }}>AgencyOS</div>
          <p style={{ color: "var(--clr-text-muted)", fontSize: 14 }}>Reset your password</p>
        </div>

        <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "2rem" }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <p style={{ color: "var(--clr-text)", fontWeight: 600, marginBottom: 8 }}>Check your inbox</p>
              <p style={{ color: "var(--clr-text-muted)", fontSize: 13 }}>If an account exists for {email}, you&apos;ll receive a reset link shortly.</p>
              <Link href="/login" style={{ display: "inline-block", marginTop: 16, color: "var(--clr-accent)", fontSize: 13, textDecoration: "none" }}>Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "0.75rem 1rem", color: "#f87171", fontSize: 14 }}>
                  {error}
                </div>
              )}
              <p style={{ color: "var(--clr-text-muted)", fontSize: 13, margin: 0 }}>Enter your email address and we&apos;ll send you a link to reset your password.</p>
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
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", background: loading ? "var(--clr-card-hover)" : "var(--clr-accent)", color: "#fff", border: "none", borderRadius: 8, padding: "0.75rem", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "var(--clr-text-muted)", textDecoration: "none" }}>Back to login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

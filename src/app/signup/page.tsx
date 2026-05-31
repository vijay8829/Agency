"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", organizationName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(form.password)) return setError("Password must contain an uppercase letter.");
    if (!/[0-9]/.test(form.password)) return setError("Password must contain a number.");
    setLoading(true);
    try {
      await auth.signup(form);
      router.push("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--clr-input-bg)", border: "1px solid var(--clr-input-border)", borderRadius: 8, padding: "0.625rem 0.875rem", color: "var(--clr-text)", fontSize: 14, boxSizing: "border-box", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-bg)", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--clr-text)", marginBottom: 8 }}>AgencyOS</div>
          <p style={{ color: "var(--clr-text-muted)", fontSize: 14 }}>Create your agency account</p>
        </div>

        <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "0.75rem 1rem", color: "#f87171", fontSize: 14 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--clr-text)", marginBottom: 6 }}>Your Name</label>
              <input type="text" value={form.name} onChange={set("name")} required autoFocus placeholder="Jane Smith" style={inputStyle} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--clr-text)", marginBottom: 6 }}>Agency Name</label>
              <input type="text" value={form.organizationName} onChange={set("organizationName")} required placeholder="Acme Agency" style={inputStyle} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--clr-text)", marginBottom: 6 }}>Work Email</label>
              <input type="email" value={form.email} onChange={set("email")} required placeholder="jane@acme.agency" style={inputStyle} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--clr-text)", marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={set("password")} required placeholder="Min 8 chars, 1 uppercase, 1 number" style={inputStyle} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "var(--clr-card-hover)" : "var(--clr-accent)", color: "#fff", border: "none", borderRadius: 8, padding: "0.75rem", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "var(--clr-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--clr-accent)", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

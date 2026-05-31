export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-zinc-400 mb-10">Effective date: January 1, 2025</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">1. What We Collect</h2>
        <p className="text-zinc-300">
          We collect: account information (name, email, password hash), business data you enter (leads, clients, invoices), usage logs for security and billing, and payment method details processed by Stripe (we never store raw card data).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">2. How We Use Your Data</h2>
        <p className="text-zinc-300">
          We use your data to: provide and improve the Service, send transactional emails (invoices, password resets), enforce plan limits, detect abuse, and produce anonymized analytics. We do not sell or share your personal data with third parties for marketing.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">3. Data Storage and Security</h2>
        <p className="text-zinc-300">
          Data is stored in encrypted databases. Passwords are hashed with bcrypt. Session tokens are stored as HTTP-only cookies and never exposed to JavaScript. We use TLS 1.2+ for all data in transit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">4. Data Retention</h2>
        <p className="text-zinc-300">
          Active account data is retained for the lifetime of your subscription. Upon account deletion, data is purged within 30 days. Audit logs may be retained for up to 1 year for security purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">5. Your GDPR Rights</h2>
        <p className="text-zinc-300">
          If you are in the EEA or UK, you have the right to: access your data (via Account → Export Data), correct inaccuracies, request deletion (via Account → Delete Account), and object to processing. Contact <a href="mailto:privacy@agencyos.app" className="underline text-blue-400">privacy@agencyos.app</a> for requests we cannot fulfill in-app.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">6. Cookies</h2>
        <p className="text-zinc-300">
          We use only essential cookies for authentication (HTTP-only session cookie). We do not use tracking cookies or third-party analytics cookies. See our <a href="/cookies" className="underline text-blue-400">Cookie Policy</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">7. Third-Party Processors</h2>
        <p className="text-zinc-300">
          We use Stripe for payment processing and Resend for transactional email. Both are GDPR-compliant processors bound by data processing agreements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">8. Contact</h2>
        <p className="text-zinc-300">
          Data privacy inquiries: <a href="mailto:privacy@agencyos.app" className="underline text-blue-400">privacy@agencyos.app</a>.
        </p>
      </section>
    </main>
  );
}

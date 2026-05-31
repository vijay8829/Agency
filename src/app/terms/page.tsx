export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-zinc-400 mb-10">Effective date: January 1, 2025</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
        <p className="text-zinc-300">
          By accessing or using AgencyOS ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
        <p className="text-zinc-300">
          AgencyOS is a SaaS platform for digital agencies providing CRM, invoicing, automation, and team management tools. Features vary by subscription plan.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">3. Account Responsibilities</h2>
        <p className="text-zinc-300">
          You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized access.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">4. Subscriptions and Billing</h2>
        <p className="text-zinc-300">
          Subscriptions renew automatically at the end of each billing cycle. You may cancel at any time. No refunds are issued for partial periods except as described in our Refund Policy.
          Plan limits are enforced. Exceeding limits requires an upgrade.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">5. Acceptable Use</h2>
        <p className="text-zinc-300">
          You may not use the Service to send spam, transmit malicious code, violate any laws, infringe intellectual property rights, or reverse-engineer the platform. We reserve the right to terminate accounts that violate these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">6. Data Ownership</h2>
        <p className="text-zinc-300">
          You retain ownership of all data you input into the Service. We do not sell your data. You may export or delete your data at any time via Account Settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">7. Service Availability</h2>
        <p className="text-zinc-300">
          We target 99.9% monthly uptime. Scheduled maintenance will be announced 24 hours in advance. We are not liable for interruptions beyond our reasonable control.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">8. Limitation of Liability</h2>
        <p className="text-zinc-300">
          To the fullest extent permitted by law, AgencyOS is not liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">9. Changes to Terms</h2>
        <p className="text-zinc-300">
          We may update these Terms with 30 days' notice via email or in-app announcement. Continued use after the effective date constitutes acceptance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">10. Contact</h2>
        <p className="text-zinc-300">
          Questions? Email <a href="mailto:legal@agencyos.app" className="underline text-blue-400">legal@agencyos.app</a>.
        </p>
      </section>
    </main>
  );
}

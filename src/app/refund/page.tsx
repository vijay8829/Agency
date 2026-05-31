export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
      <p className="text-zinc-400 mb-10">Effective date: January 1, 2025</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">14-Day Money-Back Guarantee</h2>
        <p className="text-zinc-300">
          New paid subscriptions are eligible for a full refund within 14 days of the first charge. To request a refund, email <a href="mailto:billing@agencyos.app" className="underline text-blue-400">billing@agencyos.app</a> with your account email and reason. Refunds are processed within 5–10 business days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Free Trial</h2>
        <p className="text-zinc-300">
          We offer a 14-day free trial with no credit card required. You will not be charged until you upgrade to a paid plan. You may cancel at any time during the trial period.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Cancellations</h2>
        <p className="text-zinc-300">
          You may cancel your subscription at any time from Account Settings → Billing. Cancellation takes effect at the end of the current billing period. You retain access until that date. No partial-period refunds are issued for cancellations after the 14-day window.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Annual Plans</h2>
        <p className="text-zinc-300">
          Annual plans may be refunded in full within 30 days of purchase. After 30 days, a prorated refund for unused months may be issued at our discretion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Exceptions</h2>
        <p className="text-zinc-300">
          Refunds will not be issued for: accounts terminated for Terms of Service violations, requests made after the refund eligibility window, or add-on services already delivered.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Contact</h2>
        <p className="text-zinc-300">
          Billing questions: <a href="mailto:billing@agencyos.app" className="underline text-blue-400">billing@agencyos.app</a>
        </p>
      </section>
    </main>
  );
}

export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-zinc-400 mb-10">Effective date: January 1, 2025</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">What Cookies We Use</h2>
        <p className="text-zinc-300 mb-4">AgencyOS uses only essential cookies required to operate the service. We do not use advertising, analytics, or tracking cookies.</p>

        <div className="border border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800">
              <tr>
                <th className="text-left p-3 font-semibold text-zinc-200">Name</th>
                <th className="text-left p-3 font-semibold text-zinc-200">Type</th>
                <th className="text-left p-3 font-semibold text-zinc-200">Purpose</th>
                <th className="text-left p-3 font-semibold text-zinc-200">Expires</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-700">
                <td className="p-3 font-mono text-zinc-300">session</td>
                <td className="p-3 text-zinc-400">Essential</td>
                <td className="p-3 text-zinc-300">Authenticates your session. HTTP-only, not accessible to JavaScript.</td>
                <td className="p-3 text-zinc-400">7 days</td>
              </tr>
              <tr className="border-t border-zinc-700">
                <td className="p-3 font-mono text-zinc-300">theme</td>
                <td className="p-3 text-zinc-400">Preference</td>
                <td className="p-3 text-zinc-300">Remembers your color theme preference (localStorage, not a cookie).</td>
                <td className="p-3 text-zinc-400">Persistent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Managing Cookies</h2>
        <p className="text-zinc-300">
          Because we only use essential cookies, disabling them will prevent you from logging in. You can clear cookies at any time via your browser settings — this will log you out of all sessions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Contact</h2>
        <p className="text-zinc-300">
          Questions? <a href="mailto:privacy@agencyos.app" className="underline text-blue-400">privacy@agencyos.app</a>
        </p>
      </section>
    </main>
  );
}

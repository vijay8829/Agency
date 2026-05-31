/**
 * Email delivery service.
 * Uses Resend when RESEND_API_KEY is set.
 * Falls back to console.info in development (so auth flows work locally).
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendResult {
  delivered: boolean;
  messageId?: string;
  error?: string;
}

async function send(payload: EmailPayload): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "AgencyOS <noreply@agencyos.app>";

  if (!apiKey) {
    // Dev fallback — log to console so flows still work locally
    console.info(`[Email Dev] To: ${payload.to}\nSubject: ${payload.subject}\n${payload.text ?? "(html only)"}`);
    return { delivered: true, messageId: `dev-${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: payload.to, subject: payload.subject, html: payload.html, text: payload.text }),
    });

    const json = await res.json() as { id?: string; message?: string };

    if (!res.ok) {
      return { delivered: false, error: json.message ?? `Resend error ${res.status}` };
    }

    return { delivered: true, messageId: json.id };
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

function baseLayout(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f1117;color:#e2e8f0;margin:0;padding:0}
    .wrap{max-width:560px;margin:40px auto;background:#1a1d27;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden}
    .header{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center}
    .logo{color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px}
    .body{padding:32px}
    .btn{display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:20px 0}
    .footer{padding:20px 32px;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.06)}
    p{line-height:1.6;color:#94a3b8}h2{color:#e2e8f0;margin:0 0 16px}
    .code{background:#0f1117;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:12px 20px;font-family:monospace;font-size:20px;letter-spacing:4px;color:#6366f1;text-align:center;margin:20px 0}
  </style></head><body><div class="wrap">
    <div class="header"><div class="logo">AgencyOS</div></div>
    <div class="body">${body}</div>
    <div class="footer">AgencyOS · If you didn't request this, ignore this email.</div>
  </div></body></html>`;
}

export const emailService = {
  sendPasswordReset: async (to: string, name: string, resetUrl: string): Promise<SendResult> =>
    send({
      to,
      subject: "Reset your AgencyOS password",
      html: baseLayout(`
        <h2>Reset your password</h2>
        <p>Hi ${name}, we received a request to reset your password.</p>
        <p>Click the button below. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" class="btn">Reset Password</a>
        <p style="font-size:13px">Or copy this URL: <code style="word-break:break-all">${resetUrl}</code></p>
      `),
      text: `Hi ${name},\n\nReset your password: ${resetUrl}\n\nExpires in 1 hour.`,
    }),

  sendEmailVerification: async (to: string, name: string, verifyUrl: string): Promise<SendResult> =>
    send({
      to,
      subject: "Verify your AgencyOS email",
      html: baseLayout(`
        <h2>Confirm your email</h2>
        <p>Hi ${name}, one more step to activate your AgencyOS account.</p>
        <a href="${verifyUrl}" class="btn">Verify Email</a>
      `),
      text: `Hi ${name},\n\nVerify your email: ${verifyUrl}`,
    }),

  sendTeamInvite: async (to: string, inviterName: string, orgName: string, role: string, inviteUrl: string): Promise<SendResult> =>
    send({
      to,
      subject: `${inviterName} invited you to ${orgName} on AgencyOS`,
      html: baseLayout(`
        <h2>You've been invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> as a ${role}.</p>
        <a href="${inviteUrl}" class="btn">Accept Invitation</a>
        <p style="font-size:13px">Link expires in 7 days.</p>
      `),
      text: `${inviterName} invited you to ${orgName}.\n\nAccept: ${inviteUrl}`,
    }),

  sendInvoiceNotification: async (to: string, clientName: string, amount: string, dueDate: string, invoiceUrl: string): Promise<SendResult> =>
    send({
      to,
      subject: `Invoice for ${clientName} — ${amount}`,
      html: baseLayout(`
        <h2>Invoice Ready</h2>
        <p>A new invoice has been created for <strong>${clientName}</strong>.</p>
        <p><strong>Amount:</strong> ${amount}<br><strong>Due:</strong> ${dueDate}</p>
        <a href="${invoiceUrl}" class="btn">View Invoice</a>
      `),
      text: `Invoice for ${clientName}\nAmount: ${amount}\nDue: ${dueDate}\n\nView: ${invoiceUrl}`,
    }),

  sendWelcome: async (to: string, name: string, orgName: string, loginUrl: string): Promise<SendResult> =>
    send({
      to,
      subject: `Welcome to AgencyOS — ${orgName} is ready`,
      html: baseLayout(`
        <h2>Welcome, ${name}!</h2>
        <p>Your AgencyOS workspace for <strong>${orgName}</strong> is set up and ready.</p>
        <p>Your AI Employee is standing by to qualify leads, draft content, and run your automations.</p>
        <a href="${loginUrl}" class="btn">Open Dashboard</a>
      `),
      text: `Welcome to AgencyOS!\n\nYour workspace for ${orgName} is ready.\n\nSign in: ${loginUrl}`,
    }),

  sendPaymentFailed: async (to: string, name: string, amount: string, updateUrl: string): Promise<SendResult> =>
    send({
      to,
      subject: "Action required: Payment failed for AgencyOS",
      html: baseLayout(`
        <h2>Payment failed</h2>
        <p>Hi ${name}, we couldn't process your payment of <strong>${amount}</strong>.</p>
        <p>Please update your payment method to keep your account active.</p>
        <a href="${updateUrl}" class="btn">Update Payment Method</a>
      `),
      text: `Payment of ${amount} failed.\n\nUpdate payment: ${updateUrl}`,
    }),
};

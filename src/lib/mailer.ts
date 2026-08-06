import { SALON } from "@/lib/constants";

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.MAIL_FROM ?? "Divine Favour <onboarding@resend.dev>";

export const mailerConfigured = Boolean(RESEND_KEY);

export type MailResult = { ok: true; sent: boolean } | { ok: true; sent: false; reason: "unconfigured" } | { ok: false; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<MailResult> {
  if (!RESEND_KEY) {
    console.log(`[mailer:disabled] "${input.subject}" -> ${input.to}`);
    return { ok: true, sent: false, reason: "unconfigured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[mailer] send failed", res.status, body.slice(0, 300));
      return { ok: false, error: `Mail service returned ${res.status}` };
    }
    return { ok: true, sent: true };
  } catch (e) {
    console.error("[mailer] error", e);
    return { ok: false, error: "Mail service unreachable" };
  }
}

export function emailShell(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#221517">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ece4db">
        <tr><td style="background:#221517;padding:28px 36px;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#d4af37;letter-spacing:1px">${SALON.name}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#b98a93;letter-spacing:3px;text-transform:uppercase">${SALON.tagline}</p>
        </td></tr>
        <tr><td style="padding:36px">
          <h1 style="margin:0 0 16px;font-size:24px;color:#221517">${title}</h1>
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a3f42">${bodyHtml}</div>
        </td></tr>
        <tr><td style="padding:24px 36px;background:#faf7f2;border-top:1px solid #ece4db;text-align:center">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9a8b90">
            ${SALON.address} · <a href="tel:${SALON.phone.replace(/\s/g, "")}" style="color:#b76e79;text-decoration:none">${SALON.phone}</a> ·
            <a href="mailto:${SALON.email}" style="color:#b76e79;text-decoration:none">${SALON.email}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

export function orderConfirmationHtml(input: { ref: string; total: number; address: string | null; items: { name: string; qty: number; price: number }[]; payment: string }) {
  const rows = input.items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e9e1">${i.name} × ${i.qty}</td><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;text-align:right">R${i.price * i.qty}</td></tr>`)
    .join("");
  return emailShell(
    `Order ${input.ref} received`,
    `<p>Thank you for shopping with us. Your order has been received.</p>
     <table style="width:100%;font-family:Arial,sans-serif;font-size:13px;border-collapse:collapse">${rows}</table>
     <p style="margin-top:16px;font-size:15px"><strong>Total: R${Math.round(input.total)}</strong> · Payment: ${input.payment}</p>
     <p>${input.address ? `We'll ship to <strong>${input.address}</strong> once it's ready.` : "Collect at the salon when we let you know it's ready."}</p>`,
  );
}

export function bookingConfirmationHtml(input: { ref: string; service: string; stylist: string; date: string; time: string; price: number }) {
  return emailShell(
    `Booking ${input.ref} received`,
    `<p>Your <strong>${input.service}</strong> request is in! Here's what we have:</p>
     <table style="width:100%;font-family:Arial,sans-serif;font-size:13px;border-collapse:collapse">
       <tr><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;color:#9a8b90">Date</td><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;text-align:right"><strong>${input.date}</strong></td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;color:#9a8b90">Time</td><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;text-align:right"><strong>${input.time}</strong></td></tr>
       <tr><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;color:#9a8b90">Stylist</td><td style="padding:8px 0;border-bottom:1px solid #f0e9e1;text-align:right"><strong>${input.stylist}</strong></td></tr>
       <tr><td style="padding:8px 0;color:#9a8b90">Treatment</td><td style="padding:8px 0;text-align:right"><strong>R${Math.round(input.price)}</strong></td></tr>
     </table>
     <p style="margin-top:16px">We'll confirm availability by email or WhatsApp shortly. If anything changes, we'll be in touch.</p>`,
  );
}

export function passwordResetHtml(input: { name: string; link: string; minutes: number }) {
  return emailShell(
    "Reset your password",
    `<p>Hi ${input.name},</p>
     <p>Someone asked to reset your password. If that was you, tap the button below — it expires in ${input.minutes} minutes.</p>
     <p style="text-align:center;margin:28px 0">
       <a href="${input.link}" style="background:#221517;color:#d4af37;text-decoration:none;padding:13px 30px;border-radius:999px;font-weight:bold;font-size:14px">Reset my password</a>
     </p>
     <p style="font-size:12px;color:#9a8b90">If you didn't request this, you can safely ignore this email — your password stays the same.</p>`,
  );
}

export function giftCardEmailHtml(input: { amount: number; code: string; recipientName: string | null; senderName: string; message: string | null; shopUrl: string }) {
  return emailShell(
    `You've been gifted ${input.amount} ZAR of beauty!`,
    `<p>Hello${input.recipientName ? ` ${input.recipientName}` : ""},</p>
     <p><strong>${input.senderName}</strong> sent you a Divine Favour gift card worth <strong>R${Math.round(input.amount)}</strong>.</p>
     ${input.message ? `<p style="font-style:italic;border-left:3px solid #d4af37;padding:8px 16px;background:#faf7f2">"${input.message}"</p>` : ""}
     <div style="margin:24px 0;border:2px dashed #d4af37;border-radius:14px;padding:20px;text-align:center;background:#fdf9ef">
       <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#9a8b90;text-transform:uppercase">Your gift card code</p>
       <p style="margin:0;font-size:22px;font-weight:bold;color:#221517;letter-spacing:2px">${input.code}</p>
     </div>
     <p>Redeem it in salon or online at <a href="${input.shopUrl}" style="color:#b76e79">${input.shopUrl}</a>. It never expires.</p>`,
  );
}

export function paymentReceivedHtml(input: { ref: string; amount: number; what: string }) {
  return emailShell(
    "Payment received",
    `<p>We've received your payment of <strong>R${Math.round(input.amount)}</strong> for ${input.what} (${input.ref}).</p>
     <p>Thanks for trusting Divine Favour — we can't wait to see you!</p>`,
  );
}

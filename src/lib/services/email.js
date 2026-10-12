import { getEnv } from "@/lib/env";
import nodemailer from "nodemailer";

/**
 * Best-effort contact-form notification email.
 *
 * This module is intentionally optional and side-effect free: it never throws
 * and never blocks persistence. If email is not configured (no API key or
 * recipient) it resolves to `{ sent: false, skipped: true }`. Delivery for the
 * public `POST /api/contact` route happens AFTER the inquiry is committed, so a
 * delivery failure can never lose a message.
 */

function buildPlainText(inquiry) {
  const lines = [
    `New contact message received.`,
    ``,
    `Name:    ${inquiry.name}`,
    `Email:   ${inquiry.email}`,
  ];
  if (inquiry.company) lines.push(`Company: ${inquiry.company}`);
  if (inquiry.subject) lines.push(`Subject: ${inquiry.subject}`);
  if (inquiry.locale) lines.push(`Locale:  ${inquiry.locale}`);
  if (inquiry.pageRef) lines.push(`Page:    ${inquiry.pageRef}`);
  lines.push(``, `Message:`, inquiry.message);
  return lines.join("\n");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function siteUrl(env) {
  return (env.NEXT_PUBLIC_SITE_URL || "https://mithrabyte.com").replace(/\/$/, "");
}

/**
 * Table-based, inline-styled HTML for broad email-client support. Brand assets
 * use the public PNG rather than SVG because several email clients block SVG.
 */
export function renderMithraByteEmail({ env, eyebrow, title, content, footer }) {
  const baseUrl = siteUrl(env);
  const safeContent = escapeHtml(content).replaceAll("\n", "<br />");
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#0b0b10;color:#D3D5FD;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b10;padding:32px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#15141c;border:1px solid #342d45;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#211c31 0%,#121119 72%);border-bottom:1px solid #493c62;">
        <table role="presentation" cellspacing="0" cellpadding="0"><tr>
          <td style="padding-right:12px;"><img src="${baseUrl}/logo.png" width="42" height="42" alt="MithraByte" style="display:block;border:0;border-radius:9px;" /></td>
          <td><div style="font-size:20px;font-weight:700;letter-spacing:.2px;color:#D3D5FD;">MithraByte</div><div style="margin-top:3px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#927FBF;">${escapeHtml(eyebrow)}</div></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:32px;"><h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#D3D5FD;">${escapeHtml(title)}</h1><div style="font-size:15px;line-height:1.7;color:#c5c2d2;">${safeContent}</div></td></tr>
      <tr><td style="padding:20px 32px;background:#100f16;border-top:1px solid #342d45;font-size:12px;line-height:1.6;color:#938da5;">${escapeHtml(footer || "MithraByte · Private AI and custom software")}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function buildInquiryHtml(inquiry, env) {
  const details = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.company && `Company: ${inquiry.company}`,
    inquiry.subject && `Subject: ${inquiry.subject}`,
    inquiry.locale && `Locale: ${inquiry.locale}`,
    inquiry.pageRef && `Page: ${inquiry.pageRef}`,
    "",
    inquiry.message,
  ].filter(Boolean).join("\n");
  return renderMithraByteEmail({ env, eyebrow: "New inquiry", title: "A new contact message arrived", content: details, footer: "Reply from the MithraByte admin inbox." });
}

function getSmtpConfig(env) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) return null;

  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE
      ? env.SMTP_SECURE === "true"
      : env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  };
}

function smtpFrom(env) {
  const address = env.SMTP_FROM_EMAIL || env.SMTP_USER;
  return env.SMTP_FROM_NAME ? `${env.SMTP_FROM_NAME} <${address}>` : address;
}

/**
 * Sends an admin response through the configured Hostinger-compatible SMTP
 * mailbox. This returns a result rather than throwing so callers can show a
 * clear save-only state while SMTP is intentionally not configured.
 */
export async function sendInquiryReply(inquiry, reply) {
  let env;
  try {
    env = getEnv();
  } catch {
    return { sent: false, skipped: true, reason: "SMTP is not configured." };
  }

  const config = getSmtpConfig(env);
  if (!config) {
    return { sent: false, skipped: true, reason: "SMTP is not configured." };
  }

  try {
    const transporter = nodemailer.createTransport(config);
    await transporter.sendMail({
      from: smtpFrom(env),
      to: inquiry.email,
      replyTo: reply.fromEmail || undefined,
      subject: reply.subject,
      text: reply.body,
      html: renderMithraByteEmail({
        env,
        eyebrow: "MithraByte response",
        title: reply.subject,
        content: reply.body,
        footer: "This message was sent in response to your MithraByte inquiry.",
      }),
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] inquiry reply delivery error:", err);
    return { sent: false, error: err?.message || "SMTP delivery failed." };
  }
}

export async function sendInquiryNotification(inquiry) {
  let env;
  try {
    env = getEnv();
  } catch {
    return { sent: false, skipped: true };
  }

  const to = env.INQUIRY_NOTIFY_EMAIL;
  const smtpConfig = getSmtpConfig(env);
  if (smtpConfig && to) {
    try {
      const transporter = nodemailer.createTransport(smtpConfig);
      await transporter.sendMail({
        from: smtpFrom(env),
        to,
        subject: `New contact message from ${inquiry.name}`,
        text: buildPlainText(inquiry),
        html: buildInquiryHtml(inquiry, env),
        replyTo: inquiry.email,
      });
      return { sent: true };
    } catch (err) {
      console.error("[email] inquiry notification SMTP error:", err);
      return { sent: false, error: err?.message || "SMTP delivery failed." };
    }
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey || !to) return { sent: false, skipped: true };

  const from = env.INQUIRY_FROM_EMAIL || "Mithrabyte <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New contact message from ${inquiry.name}`,
        text: buildPlainText(inquiry),
        html: buildInquiryHtml(inquiry, env),
        reply_to: inquiry.email,
      }),
    });

    if (!res.ok) {
      console.error(`[email] inquiry notification failed with status ${res.status}`);
      return { sent: false, error: `HTTP ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] inquiry notification error:", err);
    return { sent: false, error: err?.message || "unknown error" };
  }
}

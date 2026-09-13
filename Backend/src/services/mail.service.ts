import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

export type MailMessage = { to: string; subject: string; text: string; html: string };

/**
 * Outgoing email. Uses SMTP when `SMTP_HOST` is configured; otherwise messages
 * are logged (development) and kept in memory so tests can inspect them.
 */
let transporter: Transporter | null = null;
const sentInMemory: MailMessage[] = [];

function smtpTransport(): Transporter | null {
  if (!env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.smtpSecure,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

export const mailService = {
  get isConfigured(): boolean {
    return Boolean(env.SMTP_HOST);
  },

  async send(message: MailMessage): Promise<void> {
    const transport = smtpTransport();
    if (transport) {
      await transport.sendMail({ from: env.MAIL_FROM, ...message });
      return;
    }
    sentInMemory.push(message);
    if (sentInMemory.length > 50) sentInMemory.shift();
    if (!env.isTest) {
      logger.warn({ to: message.to, subject: message.subject }, `SMTP is not configured — email not delivered. Body:\n${message.text}`);
    }
  },

  /** Messages captured while SMTP is not configured (tests / local development). */
  outbox(): readonly MailMessage[] {
    return sentInMemory;
  },
};

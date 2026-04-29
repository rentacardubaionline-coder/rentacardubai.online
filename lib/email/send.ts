import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com",
  port: Number(process.env.BREVO_SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const FROM = `"RentNow" <${process.env.BREVO_SENDER_EMAIL ?? "help@rentacardubai.online"}>`;



/**
 * Send a transactional email via Brevo SMTP.
 * Errors are caught and logged — email failure never propagates to callers.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send email to", to, err);
  }
}

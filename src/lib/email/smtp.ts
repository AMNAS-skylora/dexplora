import "server-only";
import nodemailer from "nodemailer";

export async function deliverDexploraEmail(input: { to: string; subject: string; html: string; text: string }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;
  if (!user || !pass) throw new Error("Configure SMTP_USER and SMTP_APP_PASSWORD");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: { user, pass },
  });
  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: input.to, subject: input.subject, html: input.html, text: input.text,
  });
  return { id: result.messageId };
}

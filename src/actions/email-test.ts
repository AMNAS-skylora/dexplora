"use server";

import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { buildDexploraEmail } from "@/lib/email/templates";
import { isGmailSmtpConfigured, sendGmailEmail } from "@/lib/email/smtp";

/** Sends only to the signed-in administrator's own email address. */
export async function sendGmailTestEmail(): Promise<{ success?: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    return { error: "Only an administrator may send a test email." };
  }
  if (!isGmailSmtpConfigured()) {
    return { error: "Add SMTP_USER and SMTP_APP_PASSWORD in Vercel Environment Variables." };
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl || !/^https:\/\//i.test(siteUrl)) {
    return { error: "Set NEXT_PUBLIC_SITE_URL to your live https:// website address." };
  }
  const email = String(session.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "The administrator account has no valid email address." };
  }

  const message = buildDexploraEmail("TRIP_ALERT", {
    name: session.name || "Administrator",
    email,
    bookingRef: "SMTP-TEST",
    tripName: "Dexplora Email Configuration Test",
    announcement: "Gmail App Password SMTP setup is accepting messages. This is a test email, not a booking notification.",
  }, siteUrl);

  try {
    const result = await sendGmailEmail({ to: email, ...message });
    await getDb().collection("EmailDeliveryLogs").insertOne({
      kind: "SMTP_TEST", recipient: email, requestedBy: session.userId,
      status: "SMTP_ACCEPTED", smtpId: result.id, createdAt: new Date(),
    }).catch((error) => console.error("Email audit log failed", error));
    return { success: true };
  } catch (error: unknown) {
    console.error("Gmail SMTP test failed:", error instanceof Error ? error.message : "Unknown error");
    return { error: "Gmail could not accept the email. Check your App Password, Gmail settings, and deployment logs." };
  }
}

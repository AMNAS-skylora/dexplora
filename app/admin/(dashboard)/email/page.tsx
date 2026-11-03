import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isGmailSmtpConfigured } from "@/lib/email/smtp";
import { GmailTestButton } from "@/components/admin/GmailTestButton";
import { Mail, ShieldCheck, Settings2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EmailSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") redirect("/admin/dashboard");

  const configured = isGmailSmtpConfigured();
  const siteConfigured = /^https:\/\//i.test(process.env.NEXT_PUBLIC_SITE_URL || "");
  const automationEnabled = process.env.EMAIL_AUTOMATION_ENABLED === "true";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Email Notifications</h1>
        <p className="text-sm text-slate-600">Gmail App Password SMTP setup. Your password is never shown or saved in the app.</p>
      </header>
      <section className="space-y-5 rounded-3xl border border-[#E8ECF3] bg-white p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-[#3478F6]" />
          <div>
            <h2 className="font-bold text-[#0B1026]">Gmail SMTP</h2>
            <p className="text-sm text-slate-600">{configured ? "Gmail credentials configured" : "Missing Gmail credentials"}</p>
          </div>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-600" /> SMTP_USER and SMTP_APP_PASSWORD: <strong>{configured ? "Set" : "Not configured"}</strong></div>
          <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-slate-600" /> NEXT_PUBLIC_SITE_URL: <strong>{siteConfigured ? "Set" : "Missing HTTPS URL"}</strong></div>
          <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-slate-600" /> Booking and payment auto-email: <strong>{automationEnabled ? "Enabled" : "Off (safe default)"}</strong></div>
        </div>
        <div className="rounded-xl bg-[#F3F7FF] p-4 text-sm leading-7 text-slate-700">
          <p>Add these in Vercel &gt; Settings &gt; Environment Variables, then redeploy:</p>
          <pre className="mt-2 overflow-x-auto text-xs">SMTP_USER=youraccount@gmail.com{"\n"}SMTP_APP_PASSWORD=16_character_app_password{"\n"}SMTP_FROM=youraccount@gmail.com{"\n"}NEXT_PUBLIC_SITE_URL=https://your-website.com{"\n"}EMAIL_AUTOMATION_ENABLED=false</pre>
        </div>
        <GmailTestButton configured={configured && siteConfigured} />
        <p className="text-xs text-slate-500">
          Tests are sent only to the email address associated with the signed-in administrator. A successful SMTP response does not guarantee inbox delivery. Gmail sending limits apply. Enable EMAIL_AUTOMATION_ENABLED=true only after a successful test; it activates booking confirmation and payment receipt notifications.
        </p>
      </section>
    </div>
  );
}

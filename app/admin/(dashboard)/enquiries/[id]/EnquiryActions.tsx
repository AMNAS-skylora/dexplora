"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContact, restoreContact } from "@/actions";
import { normalizeWhatsAppNumber } from "@/lib/utils";

export function EnquiryActions({ id, deleted, name, phone, email }: { id: string; deleted: boolean; name: string; phone: string; email: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Hi " + name + ", thank you for contacting Dexplora Tour Planners. How can we help you with your trip?");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const digits = normalizeWhatsAppNumber(phone.trim().replace(/^00/, "+"));
  const validPhone = /^[1-9]\d{9,14}$/.test(digits) && /^[+0-9\s().-]+$/.test(phone);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const reply = encodeURIComponent(message.trim());
  const linkClass = "rounded-xl border border-[#E8ECF3] px-4 py-3 text-center text-sm font-semibold text-[#0B1026] hover:bg-[#F3F7FF]";
  function change() {
    if (!deleted && !window.confirm("Move this enquiry to Trash? You can restore it later.")) return;
    setError("");
    startTransition(async () => {
      try {
        const result = deleted ? await restoreContact(id) : await deleteContact(id);
        if (result.error) { setError(result.error); return; }
        router.refresh();
      } catch { setError("Unable to update enquiry. Please retry."); }
    });
  }
  return (
    <section className="space-y-4 rounded-3xl border border-[#E8ECF3] bg-white p-5 sm:p-7">
      <h2 className="font-bold text-[#0B1026]">{deleted ? "Recover enquiry" : "Contact customer"}</h2>
      {!deleted && <>
        <label htmlFor="enquiry-reply" className="block text-sm font-medium">Reply message</label>
        <textarea id="enquiry-reply" rows={4} maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />
        {!validPhone && <p className="text-sm text-amber-700">No valid phone number available. Phone actions are disabled.</p>}
        <div className="flex flex-wrap gap-2">
          {validPhone && message.trim() && <a href={"https://wa.me/" + digits + "?text=" + reply} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#128C4A] px-4 py-3 text-sm font-semibold text-white">WhatsApp message</a>}
          {validPhone && message.trim() && <a href={"sms:+" + digits + "?body=" + reply} className={linkClass}>SMS</a>}
          {validPhone && <a href={"tel:+" + digits} className={linkClass}>Call customer</a>}
          {validEmail && message.trim() && <a href={"mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent("Dexplora enquiry") + "&body=" + reply} className={linkClass}>Email reply</a>}
        </div>
        <p className="text-xs text-gray-500">Messages open in your messaging app for review and sending. After sending, set status to REPLIED manually.</p>
      </>}
      {deleted && <p className="text-sm text-gray-600">Restore this enquiry to its original inbox status. The customer message and contact details are preserved.</p>}
      <button type="button" disabled={pending} onClick={change} className={"rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 " + (deleted ? "bg-[#3478F6] text-white" : "border border-red-200 text-red-700")}>{pending ? "Updating..." : deleted ? "Restore enquiry" : "Move to Trash"}</button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  );
}

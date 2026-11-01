"use client";
import { useState } from "react";
import { getWhatsAppAudience, sendWhatsAppCampaign } from "@/actions/whatsapp";
type Trip = { id: string; title: string; startDate: string };
export function WhatsAppManager({ trips, configured }: { trips: Trip[]; configured: boolean }) {
  const [tripBatchId, setTrip] = useState(trips[0]?.id || "");
  const [kind, setKind] = useState<"BALANCE_REMINDER" | "BOOKING_CONFIRMATION" | "TRIP_ALERT" | "TRAVEL_DETAILS">("BALANCE_REMINDER");
  const [templateName, setTemplate] = useState("");
  const [languageCode, setLanguage] = useState("en");
  const [onlyPendingBalance, setPending] = useState(true);
  const [audience, setAudience] = useState<{ total: number; eligible: number; missingConsent: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  async function preview() {
    setBusy(true); setResult("");
    try { setAudience(await getWhatsAppAudience(tripBatchId, onlyPendingBalance)); }
    catch (e: any) { setResult(e.message); }
    finally { setBusy(false); }
  }
  async function send() {
    if (!audience || !configured || !window.confirm(`Send approved WhatsApp template to up to ${audience.eligible} opted-in travellers?`)) return;
    setBusy(true); setResult("");
    try {
      const r = await sendWhatsAppCampaign({ tripBatchId, kind, templateName, languageCode, onlyPendingBalance }, true);
      setResult("error" in r ? String(r.error) : `Sent: ${r.sent}; Failed: ${r.failed}`);
    } catch (e: any) { setResult(e.message); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-3xl space-y-5 pb-16">
    <div><h1 className="text-2xl font-bold">WhatsApp Messages</h1><p className="text-sm text-gray-500">Send approved templates to travellers with recorded WhatsApp opt-in.</p></div>
    <div className="rounded-2xl border bg-white p-5 space-y-4">
      <p className={configured ? "text-green-700" : "text-amber-700"}>{configured ? "API credentials configured" : "API not connected — add server environment variables"}</p>
      <label className="block text-sm">Trip<select className="mt-1 w-full rounded-lg border p-3" value={tripBatchId} onChange={e => {setTrip(e.target.value);setAudience(null);}}>{trips.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <label className="block text-sm">Message Type<select className="mt-1 w-full rounded-lg border p-3" value={kind} onChange={e => {setKind(e.target.value as typeof kind);setAudience(null);}}><option value="BALANCE_REMINDER">Balance Reminder</option><option value="BOOKING_CONFIRMATION">Booking Confirmation</option><option value="TRIP_ALERT">Important Announcement</option><option value="TRAVEL_DETAILS">Travel Details</option></select></label>
      <label className="block text-sm">Approved Meta Template Name<input className="mt-1 w-full rounded-lg border p-3" value={templateName} onChange={e=>setTemplate(e.target.value)} placeholder="dexplora_balance_reminder" /></label>
      <label className="block text-sm">Template Language<input className="mt-1 w-full rounded-lg border p-3" value={languageCode} onChange={e=>setLanguage(e.target.value)} placeholder="en" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyPendingBalance} onChange={e=>{setPending(e.target.checked);setAudience(null);}} /> Only travellers with pending balance</label>
      <button className="rounded-xl border px-5 py-3" disabled={busy || !tripBatchId} onClick={preview}>Preview Recipients</button>
      {audience && <div className="rounded-xl bg-gray-100 p-4 text-sm">Total bookings: {audience.total} · Eligible: {audience.eligible} · Missing consent: {audience.missingConsent}</div>}
      <button className="block w-full rounded-xl bg-black p-3 font-semibold text-white disabled:opacity-40" disabled={busy || !configured || !audience?.eligible || !templateName} onClick={send}>{busy ? "Working…" : "Confirm & Send WhatsApp"}</button>
      {result && <p role="status" className="text-sm">{result}</p>}
    </div>
    <p className="text-xs text-gray-500">Existing website WhatsApp links are click-to-chat only. API messaging requires approved templates, opt-in and API credentials. Scheduled sending is not enabled yet.</p>
  </main>;
}

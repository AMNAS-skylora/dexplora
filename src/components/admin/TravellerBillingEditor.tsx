"use client";
import { useState } from "react";
import { saveTravellerBilling } from "@/actions/traveller-billing";
import { calculateTravellerBill, type BookingExtraCharge } from "@/lib/traveller-billing";

export function TravellerBillingEditor({ bookingId, packagePrice, paidAmount, initialFree = false, initialOverride, initialExtras = [] }: {
  bookingId: string; packagePrice: number; paidAmount: number; initialFree?: boolean;
  initialOverride?: number; initialExtras?: BookingExtraCharge[];
}) {
  const [free, setFree] = useState(initialFree);
  const [override, setOverride] = useState(initialOverride === undefined ? "" : String(initialOverride));
  const [extras, setExtras] = useState<BookingExtraCharge[]>(initialExtras);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  let bill: ReturnType<typeof calculateTravellerBill> | null = null;
  let validation = "";
  try {
    bill = calculateTravellerBill({ eventPackagePrice: packagePrice, packageComplimentary: free,
      packagePriceOverride: override === "" ? undefined : Number(override), extraCharges: extras,
      payments: [{ id: "existing", amount: paidAmount }] });
  } catch (e: any) { validation = e.message; }
  const update = (id: string, field: "description" | "amount" | "category", value: string) =>
    setExtras(items => items.map(item => item.id === id ? { ...item, [field]: field === "amount" ? Number(value) : value } : item));
  async function save() {
    if (!bill || saving) return;
    setSaving(true); setMessage("");
    try {
      const result = await saveTravellerBilling(bookingId, { packageComplimentary: free,
        packagePriceOverride: override === "" ? undefined : Number(override), extraCharges: extras });
      setMessage(result.error || "Billing saved successfully.");
    } catch { setMessage("Could not save billing."); }
    finally { setSaving(false); }
  }
  return <section className="space-y-4 rounded-2xl border border-neutral-200 p-4">
    <h2 className="text-lg font-semibold">Package & Additional Charges</h2>
    <p className="text-sm text-neutral-500">Event package: ₹{packagePrice.toLocaleString("en-IN")}. Extras are charged separately, even when the package is free.</p>
    <label className="flex items-center gap-2"><input type="checkbox" checked={free} onChange={e => setFree(e.target.checked)} /> Complimentary package</label>
    {!free && <label className="block text-sm">Custom package amount (optional)<input className="mt-1 w-full rounded-lg border p-2" type="number" min="0" value={override} onChange={e => setOverride(e.target.value)} placeholder={String(packagePrice)} /></label>}
    <div className="space-y-3">{extras.map(item => <div key={item.id} className="grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-4">
      <select className="rounded-lg border p-2" value={item.category || "OTHER"} onChange={e => update(item.id,"category",e.target.value)}>
        <option value="AC_UPGRADE">AC Upgrade</option><option value="TICKET">Ticket</option><option value="VISA">Visa</option><option value="OTHER">Other</option>
      </select>
      <input className="rounded-lg border p-2" aria-label="Description" value={item.description} placeholder="Description" onChange={e => update(item.id,"description",e.target.value)} />
      <input className="rounded-lg border p-2" aria-label="Charge amount" type="number" min="0" value={item.amount} onChange={e => update(item.id,"amount",e.target.value)} />
      <button type="button" className="rounded-lg border p-2" onClick={() => setExtras(items => items.filter(x => x.id !== item.id))}>Remove</button>
    </div>)}</div>
    <button type="button" className="rounded-lg border px-4 py-2" onClick={() => setExtras(items => [...items, { id: crypto.randomUUID(), description: "", amount: 0, category: "OTHER" }])}>+ Add Charge</button>
    {bill && <div className="space-y-1 rounded-xl bg-neutral-100 p-4 text-sm text-neutral-900">
      <p>Package payable: ₹{bill.packageAmount.toLocaleString("en-IN")}</p>
      <p>Extra charges: ₹{bill.extraTotal.toLocaleString("en-IN")}</p>
      <p className="font-semibold">Total: ₹{bill.totalAmount.toLocaleString("en-IN")}</p>
      <p>Advance / Paid: ₹{bill.paidAmount.toLocaleString("en-IN")}</p>
      <p className="font-semibold">Balance: ₹{bill.balanceAmount.toLocaleString("en-IN")}</p>
    </div>}
    {validation && <p role="alert" className="text-sm text-red-600">{validation}</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    <button type="button" disabled={!bill || saving} onClick={save} className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50">{saving ? "Saving…" : "Save Billing"}</button>
  </section>;
}

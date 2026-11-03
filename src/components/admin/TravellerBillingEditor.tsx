"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Gift, CreditCard } from "lucide-react";
import { saveTravellerBilling } from "@/actions/traveller-billing";
import {
  calculateBookingBilling,
  type TravellerBillingRow,
  type TravellerBenefit,
  type TravellerExtraCharge,
} from "@/lib/traveller-billing";

const money = (value: number) => "₹" + Number(value || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const benefits: Array<{ value: TravellerBenefit; label: string }> = [
  { value: "STANDARD", label: "Regular — Full Package Charge" },
  { value: "FULL_FREE", label: "Fully Complimentary — Package & Extras Free" },
  { value: "PACKAGE_FREE", label: "Package Free — Extras Charged Separately" },
  { value: "TICKET_FREE", label: "Included Sleeper Ticket Free" },
  { value: "CUSTOM", label: "Custom / Discounted Package Amount" },
];
const categories: Array<{ value: TravellerExtraCharge["category"]; label: string }> = [
  { value: "AC_UPGRADE", label: "Sleeper → AC Upgrade" },
  { value: "TICKET", label: "Extra Ticket" },
  { value: "VISA", label: "Visa" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "OTHER", label: "Other Charge" },
];

export function TravellerBillingEditor({
  bookingId, paidAmount, initialRows,
}: {
  bookingId: string;
  paidAmount: number;
  initialRows: TravellerBillingRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<TravellerBillingRow[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  function changeRow(slot: number, patch: Partial<TravellerBillingRow>) {
    setSaved(false);
    setRows((current) => current.map((row) => row.slot === slot ? { ...row, ...patch } : row));
  }
  function changeExtra(slot: number, extraId: string, patch: Partial<TravellerExtraCharge>) {
    setSaved(false);
    setRows((current) => current.map((row) => row.slot === slot ? {
      ...row, extras: row.extras.map((extra) => extra.id === extraId ? { ...extra, ...patch } : extra),
    } : row));
  }
  function addExtra(slot: number) {
    const extra: TravellerExtraCharge = {
      id: crypto.randomUUID(), category: "AC_UPGRADE",
      description: "Sleeper to AC upgrade difference", amount: 0, complimentary: false,
    };
    setSaved(false);
    setRows((current) => current.map((row) => row.slot === slot ?
      { ...row, extras: [...row.extras, extra] } : row));
  }
  function removeExtra(slot: number, id: string) {
    setSaved(false);
    setRows((current) => current.map((row) => row.slot === slot ?
      { ...row, extras: row.extras.filter((extra) => extra.id !== id) } : row));
  }

  let bill: ReturnType<typeof calculateBookingBilling> | undefined;
  let validation = "";
  try {
    bill = calculateBookingBilling({ rows, travellerCount: rows.length, paidAmount });
  } catch (error) {
    validation = error instanceof Error ? error.message : "Invalid billing details.";
  }

  async function save() {
    if (!bill || saving) return;
    setSaving(true); setMessage(""); setSaved(false);
    try {
      const result = await saveTravellerBilling(bookingId, rows);
      if (result.error) setMessage(result.error);
      else {
        setSaved(true);
        setMessage("Traveller billing saved. The booking totals and balance were updated.");
        router.refresh();
      }
    } catch (error) {
      console.error("Billing save failed", error);
      setMessage("Could not save billing. Your form values are still here.");
    } finally { setSaving(false); }
  }

  return (
    <section className="rounded-3xl border border-[#E8ECF3] bg-white p-4 sm:p-6 space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#0B1026]">
          <Gift className="h-5 w-5 text-[#3478F6]" />
          <h2 className="text-lg font-extrabold">Traveller Billing & Free Services</h2>
        </div>
        <p className="text-xs sm:text-sm text-[#667085]">
          Set free packages, free tickets, individual discounts, AC upgrades and other charges for every traveller.
          The rate already booked is preserved, even if the package price changes later.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => {
          const preview = bill?.rows[index];
          return (
            <article key={row.slot} className="rounded-2xl border border-[#DCE5F4] bg-[#F8FAFF] p-4 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[#3478F6]">Traveller {row.slot}</p>
                  <p className="text-sm font-extrabold text-[#0B1026]">{row.name}</p>
                </div>
                <span className="text-sm font-extrabold text-[#0B1026]">
                  {preview ? money(preview.totalPayable) : money(row.baseFare)} / total
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-[#0B1026]">
                  Traveller Name
                  <input value={row.name}
                    onChange={(event) => changeRow(row.slot, { name: event.target.value })}
                    className="w-full min-h-11 rounded-xl border border-[#DCE5F4] bg-white px-3 py-2 text-sm" />
                </label>
                <label className="space-y-1 text-xs font-semibold text-[#0B1026]">
                  Package / Complimentary Type
                  <select value={row.benefit}
                    onChange={(event) => changeRow(row.slot, { benefit: event.target.value as TravellerBenefit })}
                    className="w-full min-h-11 rounded-xl border border-[#DCE5F4] bg-white px-3 py-2 text-sm">
                    {benefits.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <div className="text-xs rounded-xl border border-[#E8ECF3] bg-white px-3 py-3">
                  <span className="text-[#667085]">Original package rate (per traveller)</span>
                  <p className="mt-1 text-sm font-extrabold text-[#0B1026]">{money(row.baseFare)}</p>
                </div>
                {row.benefit === "TICKET_FREE" && (
                  <label className="space-y-1 text-xs font-semibold text-[#0B1026]">
                    Included sleeper ticket value to waive (₹)
                    <input type="number" min="0" step="0.01" value={row.includedTicketValue}
                      onChange={(event) => changeRow(row.slot, { includedTicketValue: Number(event.target.value) })}
                      className="w-full min-h-11 rounded-xl border border-[#DCE5F4] bg-white px-3 py-2 text-sm" />
                    <span className="block text-[11px] text-[#667085]">Only the included ticket portion is discounted, not the whole package.</span>
                  </label>
                )}
                {row.benefit === "CUSTOM" && (
                  <label className="space-y-1 text-xs font-semibold text-[#0B1026]">
                    Custom package charge (₹)
                    <input type="number" min="0" step="0.01" value={row.customPackageAmount ?? ""}
                      onChange={(event) => changeRow(row.slot, {
                        customPackageAmount: event.target.value === "" ? null : Number(event.target.value),
                      })}
                      className="w-full min-h-11 rounded-xl border border-[#DCE5F4] bg-white px-3 py-2 text-sm" />
                  </label>
                )}
                {row.benefit !== "STANDARD" && (
                  <label className="space-y-1 text-xs font-semibold text-[#0B1026] sm:col-span-2">
                    Complimentary reason / internal notes
                    <input value={row.reason || ""}
                      onChange={(event) => changeRow(row.slot, { reason: event.target.value })}
                      placeholder="e.g. special guest, sponsor, complimentary sleeper ticket"
                      className="w-full min-h-11 rounded-xl border border-[#DCE5F4] bg-white px-3 py-2 text-sm" />
                  </label>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0B1026]">Additional Charges / Upgrades</h3>
                  <button type="button" onClick={() => addExtra(row.slot)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#3478F6]/30 bg-white px-3 py-2 text-xs font-semibold text-[#3478F6]">
                    <Plus className="h-4 w-4" /> Add Charge
                  </button>
                </div>
                {row.extras.map((extra) => (
                  <div key={extra.id} className="grid gap-2 rounded-xl border border-[#DCE5F4] bg-white p-3 sm:grid-cols-12 sm:items-end">
                    <label className="space-y-1 text-xs font-semibold sm:col-span-3">
                      Type
                      <select value={extra.category}
                        onChange={(event) => changeExtra(row.slot, extra.id, { category: event.target.value as TravellerExtraCharge["category"] })}
                        className="w-full min-h-10 rounded-lg border border-[#DCE5F4] px-2 text-xs">
                        {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-xs font-semibold sm:col-span-4">
                      Description
                      <input value={extra.description}
                        onChange={(event) => changeExtra(row.slot, extra.id, { description: event.target.value })}
                        className="w-full min-h-10 rounded-lg border border-[#DCE5F4] px-2 text-xs" />
                    </label>
                    <label className="space-y-1 text-xs font-semibold sm:col-span-2">
                      Extra (₹)
                      <input type="number" min="0" step="0.01" value={extra.amount}
                        onChange={(event) => changeExtra(row.slot, extra.id, { amount: Number(event.target.value) })}
                        className="w-full min-h-10 rounded-lg border border-[#DCE5F4] px-2 text-xs" />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2 min-h-10">
                      <input type="checkbox" checked={Boolean(extra.complimentary) || row.benefit === "FULL_FREE"}
                        disabled={row.benefit === "FULL_FREE"}
                        onChange={(event) => changeExtra(row.slot, extra.id, { complimentary: event.target.checked })} />
                      Free
                    </label>
                    <button type="button" aria-label="Remove extra charge" onClick={() => removeExtra(row.slot, extra.id)}
                      className="flex min-h-10 items-center justify-center rounded-lg border border-red-100 text-red-600 sm:col-span-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <p className="text-[11px] leading-relaxed text-[#667085]">
                  For a ₹14,000 package with sleeper included, choose AC Upgrade and enter only the difference
                  (for example ₹2,000). Total becomes ₹16,000. Package Free still charges extras unless marked Free.
                </p>
              </div>
              {preview && (
                <div className="flex flex-wrap justify-between gap-2 border-t border-[#DCE5F4] pt-3 text-xs font-semibold">
                  <span>Package: {money(preview.packagePayable)}</span>
                  <span>Extras: {money(preview.extraPayable)}</span>
                  <span className="font-extrabold text-[#3478F6]">Payable: {money(preview.totalPayable)}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {bill && (
        <div className="rounded-2xl bg-[#F3F7FF] border border-[#DBE6FF] p-4 space-y-2 text-sm">
          <h3 className="flex items-center gap-2 font-bold text-[#0B1026]"><CreditCard className="h-4 w-4" /> Booking Summary</h3>
          <div className="flex justify-between"><span>Package Charges</span><strong>{money(bill.packagePayable)}</strong></div>
          <div className="flex justify-between"><span>Additional Charges</span><strong>{money(bill.extrasPayable)}</strong></div>
          <div className="flex justify-between"><span>Free / Discounted Value</span><strong>{money(bill.discountAmount)}</strong></div>
          <div className="flex justify-between border-t border-[#DBE6FF] pt-2 font-extrabold text-[#0B1026]"><span>Traveller Total</span><span>{money(bill.totalAmount)}</span></div>
          <div className="flex justify-between"><span>Already Paid (unchanged)</span><strong>{money(bill.paidAmount)}</strong></div>
          <div className="flex justify-between font-extrabold"><span>Balance Due</span><span>{money(bill.balanceAmount)}</span></div>
          {bill.creditAmount > 0 && (
            <p className="text-xs font-bold text-amber-700">
              {money(bill.creditAmount)} paid above the revised total. Refund or credit reconciliation is required; existing payments are kept.
            </p>
          )}
        </div>
      )}
      {validation && <p role="alert" className="text-sm font-semibold text-red-600">{validation}</p>}
      {message && <p role="status" className={`text-sm font-semibold ${saved ? "text-emerald-700" : "text-red-600"}`}>{message}</p>}
      <button type="button" disabled={!bill || saving} onClick={save}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3478F6] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">
        <Save className="h-4 w-4" /> {saving ? "Saving Traveller Billing..." : "Save Traveller Billing"}
      </button>
    </section>
  );
}

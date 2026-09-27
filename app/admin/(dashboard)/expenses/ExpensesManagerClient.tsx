"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addExpense, deleteExpense } from "@/actions";
import { formatDate, formatPrice } from "@/lib/utils";
import { Plus, Trash2, Loader2, WalletCards, TrendingUp, TrendingDown, IndianRupee, Calendar, Package } from "lucide-react";

type PackageRow = {
  id: string;
  title: string;
  price: number;
  expensePerPerson: number;
  status: string;
};

type EventRow = {
  id: string;
  packageId: string;
  packageTitle: string;
  batchName: string;
  startDate: string | Date;
  endDate: string | Date;
  travellerCount: number;
  revenue: number;
  expensePerPerson: number;
  baseExpense: number;
  extraExpense: number;
  totalExpense: number;
  profit: number;
};

type ExpenseRow = {
  id: string;
  title: string;
  amount: number;
  category: string;
  tripBatchId?: string | null;
  packageId?: string | null;
  expenseDate?: string | Date;
  notes?: string | null;
};

export function ExpensesManagerClient({
  packages,
  events,
  expenses,
  totals,
}: {
  packages: PackageRow[];
  events: EventRow[];
  expenses: ExpenseRow[];
  totals: { revenue: number; baseExpense: number; eventExtraExpense: number; generalExpense: number };
}) {
  const [tripBatchId, setTripBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("Transport");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grandExpense = totals.baseExpense + totals.eventExtraExpense + totals.generalExpense;
  const grandProfit = totals.revenue - grandExpense;

  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setError("Expense title and valid amount are required.");
      return;
    }

    setLoading(true);
    const selectedEvent = tripBatchId ? eventMap.get(tripBatchId) : undefined;
    const res = await addExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      tripBatchId: tripBatchId || null,
      packageId: selectedEvent?.packageId || null,
      expenseDate,
      notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setTitle("");
    setAmount("");
    setNotes("");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteExpense(id);
    setDeletingId(null);
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Expenses & Profit</h1>
        <p className="text-xs text-[#667085] mt-1">
          Package base cost, event expenses, general overheads, revenue and profit in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Revenue
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{formatPrice(totals.revenue)}</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-amber-700 text-[11px] font-extrabold uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" /> Total Expense
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{formatPrice(grandExpense)}</div>
          <div className="text-[10px] text-amber-700/70 mt-1">
            Base {formatPrice(totals.baseExpense)} + Extra {formatPrice(totals.eventExtraExpense)} + General {formatPrice(totals.generalExpense)}
          </div>
        </div>

        <div className={`border rounded-3xl p-5 ${grandProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
          <div className={`flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider ${grandProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>
            <IndianRupee className="w-4 h-4" /> Profit
          </div>
          <div className={`text-2xl font-black mt-2 ${grandProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>{formatPrice(grandProfit)}</div>
        </div>

        <div className="bg-white border border-[#E8ECF3] rounded-3xl p-5">
          <div className="flex items-center gap-2 text-[#3478F6] text-[11px] font-extrabold uppercase tracking-wider">
            <WalletCards className="w-4 h-4" /> Expense Records
          </div>
          <div className="text-2xl font-black text-[#0B1026] mt-2">{expenses.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={handleAddExpense} className="bg-white rounded-3xl border border-[#E8ECF3] p-6 shadow-sm space-y-4 h-fit">
          <div>
            <h2 className="font-extrabold text-base text-[#0B1026]">Add Extra Expense</h2>
            <p className="text-[11px] text-gray-500 mt-1">Choose an event, or leave as General Overhead.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs font-bold">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Event / Package</label>
            <select
              value={tripBatchId}
              onChange={(e) => setTripBatchId(e.target.value)}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2.5 text-xs font-bold"
            >
              <option value="">General Overhead — No Event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.packageTitle} — {event.batchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Expense Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Extra hotel room"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2.5 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2.5 text-xs font-bold"
              >
                <option>Transport</option>
                <option>Hotel</option>
                <option>Food</option>
                <option>Tickets</option>
                <option>Staff</option>
                <option>Marketing</option>
                <option>Office</option>
                <option>Refund</option>
                <option>Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Expense Date</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details..."
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2.5 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-[#3478F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Expense
          </button>
        </form>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#3478F6]" />
              <h2 className="font-extrabold text-base text-[#0B1026]">Event Finance</h2>
            </div>

            <div className="space-y-3">
              {events.length > 0 ? events.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/upcoming-trips/${event.id}`}
                  className="block rounded-2xl border border-[#E8ECF3] p-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-sm text-[#0B1026]">{event.packageTitle}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{event.batchName} • {formatDate(event.startDate)} • {event.travellerCount} travellers</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-right min-w-[330px]">
                      <div>
                        <div className="text-[9px] uppercase font-extrabold text-gray-400">Revenue</div>
                        <div className="text-xs font-black text-emerald-600">{formatPrice(event.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-extrabold text-gray-400">Expense</div>
                        <div className="text-xs font-black text-amber-700">{formatPrice(event.totalExpense)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-extrabold text-gray-400">Profit</div>
                        <div className={`text-xs font-black ${event.profit >= 0 ? "text-blue-700" : "text-red-600"}`}>{formatPrice(event.profit)}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : <p className="text-xs text-gray-500">No events available.</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-[#3478F6]" />
              <h2 className="font-extrabold text-base text-[#0B1026]">Package Base Expense</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <Link key={pkg.id} href={`/admin/packages/${pkg.id}/edit`} className="rounded-2xl border border-[#E8ECF3] p-4 hover:bg-[#F8FAFC]">
                  <div className="font-extrabold text-xs text-[#0B1026]">{pkg.title}</div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <div className="text-[9px] uppercase font-extrabold text-gray-400">Selling / Person</div>
                      <div className="text-xs font-black text-emerald-600">{formatPrice(pkg.price)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-extrabold text-gray-400">Expense / Person</div>
                      <div className="text-xs font-black text-amber-700">{formatPrice(pkg.expensePerPerson)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 shadow-sm">
            <h2 className="font-extrabold text-base text-[#0B1026] mb-4">Expense Ledger</h2>
            <div className="space-y-2">
              {expenses.length > 0 ? expenses.map((expense) => {
                const event = expense.tripBatchId ? eventMap.get(expense.tripBatchId) : undefined;
                return (
                  <div key={expense.id} className="rounded-2xl bg-[#F8FAFC] border border-[#E8ECF3] p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-[#0B1026]">{expense.title}</span>
                        <span className="text-[9px] font-extrabold uppercase bg-white border rounded-lg px-2 py-0.5 text-gray-600">{expense.category}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {event ? `${event.packageTitle} — ${event.batchName}` : "General Overhead"} • {expense.expenseDate ? formatDate(expense.expenseDate) : "No date"}
                      </div>
                      {expense.notes && <div className="text-[10px] text-gray-400 italic mt-1">{expense.notes}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-amber-700">{formatPrice(expense.amount)}</span>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center disabled:opacity-50"
                        title="Delete expense"
                      >
                        {deletingId === expense.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              }) : <p className="text-xs text-gray-500">No extra expenses recorded yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

export type EnquiryRow = {
  id: string; name: string; phone: string; email: string; subject: string;
  message: string; status: string; createdAt: string; deleted: boolean;
};

const statuses = ["NEW", "READ", "REPLIED", "RESOLVED", "SPAM"];

export function EnquiryList({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"inbox" | "trash">("inbox");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const active = enquiries.filter((e) => !e.deleted);
  const trash = enquiries.filter((e) => e.deleted);
  const needle = search.trim().toLowerCase();
  const visible = (tab === "inbox" ? active : trash).filter((e) =>
    (status === "ALL" || e.status === status) &&
    (!needle || [e.name, e.phone, e.email, e.subject, e.message].some((s) => s.toLowerCase().includes(needle)))
  );
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Inbox", active.length], ["New", active.filter(e => e.status === "NEW").length], ["Replied", active.filter(e => e.status === "REPLIED").length], ["Trash", trash.length]].map(([label, count]) => (
          <div key={label} className="rounded-2xl border border-[#E8ECF3] bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">{label}</div><div className="mt-1 text-2xl font-bold text-[#0B1026]">{count}</div>
          </div>
        ))}
      </div>
      <section className="rounded-3xl border border-[#E8ECF3] bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {(["inbox", "trash"] as const).map(t => (
            <button key={t} type="button" aria-pressed={tab === t} onClick={() => { setTab(t); setStatus("ALL"); }}
              className={"rounded-xl px-4 py-2 text-sm font-semibold " + (tab === t ? "bg-[#3478F6] text-white" : "bg-[#F3F7FF] text-[#0B1026]")}>
              {t === "inbox" ? "Inbox (" + active.length + ")" : "Trash (" + trash.length + ")"}
            </button>
          ))}
          <button type="button" onClick={() => router.refresh()} className="ml-auto rounded-xl border px-3 py-2 text-sm">Refresh</button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input aria-label="Search enquiries" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, subject or message" className="min-w-0 flex-1 rounded-xl border border-[#E8ECF3] px-3 py-2 text-sm" />
          <select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-[#E8ECF3] px-3 py-2 text-sm">
            <option value="ALL">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {tab === "trash" && <p className="text-xs text-gray-500">Items here are retained. Open an enquiry to restore it to the inbox.</p>}
        <div className="divide-y divide-[#E8ECF3]">
          {visible.map(e => (
            <Link key={e.id} href={"/admin/enquiries/" + encodeURIComponent(e.id)}
              className="grid min-w-0 gap-2 rounded-xl px-2 py-4 hover:bg-[#F3F7FF] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] sm:items-center">
              <div className="min-w-0"><p className="font-bold text-[#0B1026] break-words">{e.name}</p><p className="text-xs text-gray-500 break-all">{e.phone}</p></div>
              <div className="min-w-0"><p className="text-sm font-semibold text-[#3478F6] break-words">{e.subject}</p><p className="truncate text-xs text-gray-600">{e.message}</p></div>
              <div className="flex items-center gap-3 flex-wrap sm:justify-end">
                <span className="rounded-lg bg-[#F3F7FF] px-2 py-1 text-xs font-semibold">{e.status}</span>
                <span className="text-xs text-gray-500">{formatDate(e.createdAt)}</span>
                <span className="text-xs font-bold text-[#3478F6]">View details →</span>
              </div>
            </Link>
          ))}
          {!visible.length && <p className="py-10 text-center text-sm text-gray-500">{needle || status !== "ALL" ? "No matching enquiries." : tab === "trash" ? "Trash is empty." : "No enquiries received yet."}</p>}
        </div>
      </section>
    </div>
  );
}

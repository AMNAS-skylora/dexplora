import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db, isDbAvailable } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ContactStatusSelect } from "../ContactStatusSelect";
import type { ContactStatus } from "@/actions";
import { EnquiryActions } from "./EnquiryActions";

export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(session.role)) redirect("/admin/login");
  const { id } = await params;
  if (!id || id.length > 128) notFound();
  let enquiry;
  try {
    if (!isDbAvailable()) throw new Error("Database unavailable");
    enquiry = await db.contactEnquiry.findUnique({ where: { id } });
  } catch {
    return <div role="alert" className="space-y-4 rounded-2xl border bg-white p-6"><p>Could not load this enquiry. Please retry.</p><Link href="/admin/enquiries" className="text-[#3478F6]">Back to Enquiry List</Link></div>;
  }
  if (!enquiry) notFound();
  const deleted = Boolean(enquiry.deletedAt);
  const status = (["NEW", "READ", "REPLIED", "RESOLVED", "SPAM"].includes(enquiry.status) ? enquiry.status : "NEW") as ContactStatus;
  return (
    <div className="max-w-4xl space-y-5">
      <Link href="/admin/enquiries" className="text-sm font-semibold text-[#3478F6]">← Back to Enquiry List</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-[#0B1026] break-words">{enquiry.subject || "General enquiry"}</h1><p className="text-sm text-gray-500">Enquiry details · {formatDate(enquiry.createdAt)}</p></div>
        {deleted ? <span className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">In trash</span> : <ContactStatusSelect id={id} status={status} className="rounded-xl border bg-white p-2 text-sm font-semibold" />}
      </div>
      <section className="space-y-5 rounded-3xl border border-[#E8ECF3] bg-white p-5 sm:p-7">
        <h2 className="font-bold text-[#0B1026]">Customer details</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {([["Name", enquiry.name], ["Phone", enquiry.phone], ["Email", enquiry.email], ["Received", formatDate(enquiry.createdAt)], ["Reference", id], ...(deleted ? [["Deleted", formatDate(enquiry.deletedAt)]] : [])]).map(([label, value]) => (
            <div key={label}><dt className="text-xs text-gray-500">{label}</dt><dd className="mt-1 break-all text-sm font-medium text-[#0B1026]">{value || "Not provided"}</dd></div>
          ))}
        </dl>
        <div className="border-t pt-5"><h2 className="mb-3 font-bold">Full message</h2><p className="whitespace-pre-wrap break-words rounded-2xl bg-[#F3F7FF] p-4 text-sm leading-relaxed">{enquiry.message || "No message provided."}</p></div>
      </section>
      <EnquiryActions id={id} deleted={deleted} name={String(enquiry.name || "there")} phone={String(enquiry.phone || "")} email={String(enquiry.email || "")} />
    </div>
  );
}

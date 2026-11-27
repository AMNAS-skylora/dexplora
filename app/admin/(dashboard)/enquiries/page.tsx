import { db, isDbAvailable } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EnquiryList } from "./EnquiryList";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const session = await getAdminSession();
  if (!session || !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(session.role)) redirect("/admin/login");
  let records: Record<string, unknown>[] = [];
  let loadError = false;
  try {
    if (!isDbAvailable()) throw new Error("Database unavailable");
    records = await db.contactEnquiry.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    loadError = true;
  }
  const enquiries = records.map((e) => ({
    id: String(e.id),
    name: String(e.name || "Unknown"),
    phone: String(e.phone || ""),
    email: String(e.email || ""),
    subject: String(e.subject || "General enquiry"),
    message: String(e.message || ""),
    status: String(e.status || "NEW"),
    createdAt: e.createdAt ? new Date(String(e.createdAt)).toISOString() : "",
    deleted: Boolean(e.deletedAt),
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Enquiry List</h1>
        <p className="mt-1 text-sm text-[#667085]">Manage customer messages, follow-ups and recover deleted enquiries.</p>
      </div>
      {loadError ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load enquiries. Check the database connection and reload the page. No data has been deleted.</div> : <EnquiryList enquiries={enquiries} />}
    </div>
  );
}

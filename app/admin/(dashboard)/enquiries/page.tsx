import { db } from "@/lib/db";
import { AutoSubmitStatusSelect } from "@/components/admin/AutoSubmitStatusSelect";
import { formatDate } from "@/lib/utils";
import { deleteContact } from "@/actions";
import { Trash2 } from "lucide-react";
import { ContactStatusSelect } from "./ContactStatusSelect";

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const enquiries = await db.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Contact Enquiries</h1>
        <p className="text-xs text-[#667085]">View customer messages sent through the contact form.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8ECF3] p-4 sm:p-6 shadow-sm space-y-4">
        {enquiries.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8ECF3] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Sender Name</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Message</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {enquiries.map((e: any) => (
                    <tr key={e.id} className="hover:bg-[#F3F7FF]">
                      <td className="py-4 font-bold text-[#0B1026]">{e.name}</td>
                      <td className="py-4 space-y-0.5">
                        <div className="font-semibold text-[#0B1026]">{e.phone}</div>
                        {e.email && <div className="text-gray-500 text-[11px]">{e.email}</div>}
                      </td>
                      <td className="py-4 font-medium text-[#3478F6]">{e.subject || "General Enquiry"}</td>
                      <td className="py-4 text-gray-700 max-w-xs truncate">{e.message}</td>
                      <td className="py-4 text-gray-500">{formatDate(e.createdAt)}</td>
                      <td className="py-4">
                        <ContactStatusSelect
                          id={e.id}
                          status={e.status}
                          className="bg-[#F3F7FF] border border-[#E8ECF3] text-xs font-bold text-[#0B1026] rounded-xl px-2.5 py-1 disabled:opacity-60"
                        />
                      </td>
                      <td className="py-4 text-right">
                        <form action={async () => { "use server"; await deleteContact(e.id); }}>
                          <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {enquiries.map((e: any) => (
                <div key={e.id} className="bg-[#F3F7FF]/50 border border-[#E8ECF3] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#0B1026]">{e.name}</h3>
                    <ContactStatusSelect
                      id={e.id}
                      status={e.status}
                      className="bg-white border border-[#E8ECF3] text-xs font-bold text-[#0B1026] rounded-xl px-2.5 py-1.5 disabled:opacity-60"
                    />
                  </div>
                  <span>{formatDate(e.createdAt)}</span>
                  <form action={async () => { "use server"; await deleteContact(e.id); }}>
                    <button type="submit" className="text-red-500 hover:text-red-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No contact messages received yet.</p>
        )}
      </div>

    </div>
  );
}

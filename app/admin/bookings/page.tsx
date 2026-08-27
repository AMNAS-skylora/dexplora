import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { updateBookingStatus, deleteBooking } from "@/actions";
import { Trash2, Phone, Mail, Send } from "lucide-react";

export const revalidate = 0;

export default async function AdminBookingsPage() {
  const bookings = await db.bookingEnquiry.findMany({
    include: {
      package: true,
      batch: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Booking Enquiries</h1>
        <p className="text-xs text-[#667085]">View customer bookings, reference codes (DEX-2026-XXXXXX), and update statuses.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8ECF3] p-4 sm:p-6 shadow-sm space-y-4">
        {bookings.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8ECF3] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Ref Code</th>
                    <th className="pb-3">Customer Details</th>
                    <th className="pb-3">Package & Batch</th>
                    <th className="pb-3">Travelers</th>
                    <th className="pb-3">Boarding</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F3F7FF]">
                      <td className="py-4 font-black text-[#3478F6]">{b.referenceCode}</td>
                      <td className="py-4 space-y-0.5">
                        <div className="font-bold text-[#0B1026]">{b.fullName}</div>
                        <div className="text-gray-600 font-medium">{b.phone}</div>
                        {b.email && <div className="text-gray-400 text-[11px]">{b.email}</div>}
                      </td>
                      <td className="py-4 space-y-0.5">
                        <div className="font-bold text-[#0B1026]">{b.package.title}</div>
                        {b.batch && (
                          <div className="text-[#3478F6] text-[11px] font-semibold">
                            {b.batch.batchName || "Batch"} ({formatDate(b.batch.startDate)})
                          </div>
                        )}
                      </td>
                      <td className="py-4 font-bold text-[#0B1026]">
                        {b.numberOfTravellers} (A: {b.adults}, C: {b.children})
                      </td>
                      <td className="py-4 text-gray-600">{b.boardingLocation || "Kerala"}</td>
                      <td className="py-4 text-gray-500">{formatDate(b.createdAt)}</td>
                      <td className="py-4">
                        <form action={async (formData: FormData) => {
                          "use server";
                          await updateBookingStatus(b.id, formData.get("status") as any);
                        }}>
                          <select
                            name="status"
                            defaultValue={b.status}
                            onChange={(e) => e.target.form?.requestSubmit()}
                            className="bg-[#F3F7FF] border border-[#E8ECF3] text-xs font-bold text-[#0B1026] rounded-xl px-2.5 py-1"
                          >
                            <option value="NEW">NEW</option>
                            <option value="READ">READ</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </form>
                      </td>
                      <td className="py-4 text-right">
                        <form action={async () => { "use server"; await deleteBooking(b.id); }}>
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
              {bookings.map((b) => (
                <div key={b.id} className="bg-[#F3F7FF]/50 border border-[#E8ECF3] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#3478F6]">{b.referenceCode}</span>
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateBookingStatus(b.id, formData.get("status") as any);
                    }}>
                      <select
                        name="status"
                        defaultValue={b.status}
                        onChange={(e) => e.target.form?.requestSubmit()}
                        className="bg-white border border-[#E8ECF3] text-xs font-bold text-[#0B1026] rounded-xl px-2.5 py-1.5"
                      >
                        <option value="NEW">NEW</option>
                        <option value="READ">READ</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </form>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#0B1026]">{b.fullName}</h3>
                    <p className="text-xs text-gray-600 font-semibold">{b.phone}</p>
                    {b.email && <p className="text-[11px] text-gray-400">{b.email}</p>}
                  </div>

                  <div className="pt-2 border-t border-[#E8ECF3] text-xs space-y-1">
                    <div className="font-bold text-[#0B1026]">{b.package.title}</div>
                    <div className="text-gray-500">Travelers: <span className="font-bold text-[#0B1026]">{b.numberOfTravellers}</span> (A: {b.adults}, C: {b.children})</div>
                    <div className="text-gray-500">Boarding: <span className="font-medium text-[#0B1026]">{b.boardingLocation || "Kerala"}</span></div>
                    <div className="text-[11px] text-gray-400 pt-1">{formatDate(b.createdAt)}</div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <form action={async () => { "use server"; await deleteBooking(b.id); }}>
                      <button type="submit" className="text-red-500 hover:text-red-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No booking enquiries received yet.</p>
        )}
      </div>

    </div>
  );
}

import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { createTripBatch, deleteTripBatch } from "@/actions";
import { Plus, Trash2, Calendar, Users } from "lucide-react";

export const revalidate = 0;

export default async function AdminUpcomingTripsPage() {
  const [batches, packages] = await Promise.all([
    db.tripBatch.findMany({
      include: { package: true },
      orderBy: { startDate: "asc" },
    }),
    db.package.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, price: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Upcoming Departures & Batch Scheduling</h1>
        <p className="text-xs text-[#667085]">Manage group departure dates, available seats, and batch statuses.</p>
      </div>

      {/* Batch Creator Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4 max-w-3xl">
        <h2 className="font-extrabold text-base text-[#0B1026]">Add New Departure Batch</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createTripBatch({
            packageId: (formData.get("packageId") as string) || "",
            batchName: (formData.get("batchName") as string) || undefined,
            startDate: (formData.get("startDate") as string) || "",
            endDate: (formData.get("endDate") as string) || "",
            totalSeats: Number(formData.get("totalSeats")),
            bookedSeats: Number(formData.get("bookedSeats")),
            status: (formData.get("status") as any) || "OPEN",
            priceOverride: formData.get("priceOverride") ? Number(formData.get("priceOverride")) : null,
          });
        }} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Select Package *</label>
              <select
                name="packageId"
                required
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026]"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatPrice(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Batch Name (Optional)</label>
              <input
                type="text"
                name="batchName"
                placeholder="e.g. October Autumn Special"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                required
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">End Date *</label>
              <input
                type="date"
                name="endDate"
                required
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Total Seats</label>
              <input
                type="number"
                name="totalSeats"
                defaultValue={30}
                required
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Booked Seats</label>
              <input
                type="number"
                name="bookedSeats"
                defaultValue={0}
                required
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Status</label>
              <select
                name="status"
                defaultValue="OPEN"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="OPEN">Open</option>
                <option value="FILLING_FAST">Filling Fast</option>
                <option value="ALMOST_FULL">Almost Full</option>
                <option value="SOLD_OUT">Sold Out</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors min-h-[44px]"
          >
            Schedule Departure Batch
          </button>
        </form>
      </div>

      {/* Batches View */}
      <div className="bg-white rounded-3xl border border-[#E8ECF3] p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-lg text-[#0B1026]">Scheduled Batches</h2>
        {batches.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8ECF3] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Package</th>
                    <th className="pb-3">Batch Name</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F3F7FF]">
                      <td className="py-3 font-bold text-[#0B1026]">{b.package.title}</td>
                      <td className="py-3 text-gray-600">{b.batchName || "Standard Batch"}</td>
                      <td className="py-3 font-medium text-[#3478F6]">
                        {formatDate(b.startDate)} — {formatDate(b.endDate)}
                      </td>
                      <td className="py-3 font-bold">
                        {b.availableSeats} available / {b.totalSeats}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <form action={async () => { "use server"; await deleteTripBatch(b.id); }}>
                          <button type="submit" className="text-red-600 hover:text-red-800 p-1">
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
              {batches.map((b) => (
                <div key={b.id} className="bg-[#F3F7FF]/50 border border-[#E8ECF3] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {b.status}
                    </span>
                    <form action={async () => { "use server"; await deleteTripBatch(b.id); }}>
                      <button type="submit" className="text-red-500 hover:text-red-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#0B1026]">{b.package.title}</h3>
                    <p className="text-xs text-[#3478F6] font-semibold">{b.batchName || "Standard Batch"}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E8ECF3] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Dates:</span>
                      <span className="font-bold text-[#0B1026]">{formatDate(b.startDate)} — {formatDate(b.endDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Seats:</span>
                      <span className="font-bold text-[#3478F6]">{b.availableSeats} available / {b.totalSeats}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">No batches scheduled.</p>
        )}
      </div>

    </div>
  );
}

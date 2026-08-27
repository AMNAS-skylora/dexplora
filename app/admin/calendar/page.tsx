import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createCalendarEvent, deleteCalendarEvent } from "@/actions";
import { Calendar, Plus, Trash2, Tag, CalendarDays, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminCalendarPage() {
  const events = await db.calendarEvent.findMany({
    include: {
      package: true,
      tripBatch: true,
    },
    orderBy: { startDate: "asc" },
  });

  const packages = await db.package.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const eventType = formData.get("eventType") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const packageId = formData.get("packageId") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;

    if (!title || !startDate || !endDate) return;

    await createCalendarEvent({
      title,
      eventType: eventType || "SPECIAL_EVENT",
      startDate,
      endDate,
      packageId: packageId || undefined,
      description: description || undefined,
      status: status || "OPEN",
    });

    revalidatePath("/admin/calendar");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteCalendarEvent(id);
      revalidatePath("/admin/calendar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8ECF3] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B1026] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#3478F6]" />
            <span>Calendar Event Management</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Create custom calendar events, anniversaries, special offers, holidays, or closed departure days.
          </p>
        </div>
      </div>

      {/* Event Creation Form */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8ECF3] shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#3478F6] flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Add Special Calendar Event</span>
        </h3>

        <form action={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">Event Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Dexplora 5th Anniversary Special"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">Event Type</label>
            <select
              name="eventType"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            >
              <option value="SPECIAL_EVENT">Special Event</option>
              <option value="ANNIVERSARY">Anniversary</option>
              <option value="OFFER">Special Offer</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="CLOSED_DAY">Closed Day</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">Link Package (Optional)</label>
            <select
              name="packageId"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            >
              <option value="">None (Custom Event Only)</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">Start Date</label>
            <input
              type="date"
              name="startDate"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">End Date</label>
            <input
              type="date"
              name="endDate"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">Status</label>
            <select
              name="status"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            >
              <option value="OPEN">Open</option>
              <option value="FILLING_FAST">Filling Fast</option>
              <option value="ALMOST_FULL">Almost Full</option>
              <option value="SOLD_OUT">Sold Out / Closed</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-[#0B1026]">Short Description (Optional)</label>
            <input
              type="text"
              name="description"
              placeholder="Brief summary shown inside calendar popup"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF3] text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors min-h-[44px]"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>

      {/* Events List Table */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E8ECF3] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0B1026]">Existing Custom Events ({events.length})</h3>
        </div>

        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B1026]">
              <thead className="bg-gray-50 text-[#667085] font-bold border-b border-[#E8ECF3] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Dates</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Linked Package</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3]">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50">
                    <td className="p-3.5 font-bold">{ev.title}</td>
                    <td className="p-3.5">
                      <span className="bg-[#F3F7FF] text-[#3478F6] px-2 py-0.5 rounded font-semibold text-[10px]">
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#667085]">
                      {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#16A36A]">{ev.status}</span>
                    </td>
                    <td className="p-3.5 text-[#667085]">{ev.package?.title || "—"}</td>
                    <td className="p-3.5 text-right">
                      <form action={handleDelete} className="inline-block">
                        <input type="hidden" name="id" value={ev.id} />
                        <button
                          type="submit"
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#667085] text-xs">
            No custom calendar events added yet. Use the form above to schedule special events.
          </div>
        )}
      </div>
    </div>
  );
}

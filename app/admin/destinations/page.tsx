import { db } from "@/lib/db";

import { createDestination, deleteDestination } from "@/actions";
import { Plus, Trash2, MapPin } from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminDestinationsPage() {
  const destinations = await db.destination.findMany({
    include: { _count: { select: { packages: true } } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Destination Management</h1>
        <p className="text-xs text-[#667085]">Add and organize travel regions (Meghalaya, Mahabaleshwar, Matheran, Kashmir, Goa).</p>
      </div>

      {/* Add Destination Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4 max-w-2xl">
        <h2 className="font-extrabold text-base text-[#0B1026]">Add New Destination</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createDestination({
            name: (formData.get("name") as string) || "",
            slug: (formData.get("slug") as string) || "",
            state: (formData.get("state") as string) || "",
            shortDescription: (formData.get("shortDescription") as string) || undefined,
            coverImage: (formData.get("coverImage") as string) || undefined,
            featured: formData.get("featured") === "on",
          });
        }} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Destination Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Meghalaya"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">State / Region *</label>
              <input
                type="text"
                name="state"
                required
                placeholder="e.g. Meghalaya / Maharashtra"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Cover Image URL</label>
            <input
              type="url"
              name="coverImage"
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Short Description</label>
            <input
              type="text"
              name="shortDescription"
              placeholder="Brief tagline for destination..."
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors min-h-[44px]"
          >
            Create Destination
          </button>
        </form>
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-[#E8ECF3] overflow-hidden shadow-sm flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 relative overflow-hidden shrink-0">
                {d.coverImage ? (
                  <Image src={d.coverImage} alt={d.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#3478F6]">
                    <MapPin className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#0B1026]">{d.name}</h3>
                <p className="text-xs text-[#3478F6] font-medium">{d.state}</p>
                <span className="text-[10px] text-gray-500">{d._count.packages} packages</span>
              </div>
            </div>

            <form action={async () => { "use server"; await deleteDestination(d.id); }}>
              <button type="submit" className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

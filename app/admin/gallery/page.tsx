import { db } from "@/lib/db";
import { createGalleryImage, deleteGalleryImage } from "@/actions";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const [images, destinations] = await Promise.all([
    db.galleryImage.findMany({
      include: { destination: true },
      orderBy: { createdAt: "desc" },
    }),
    db.destination.findMany({
      where: { active: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Gallery Photo Manager</h1>
        <p className="text-xs text-[#667085]">Upload photos, organize categories, and feature images in the public gallery.</p>
      </div>

      {/* Add Photo Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4 max-w-2xl">
        <h2 className="font-extrabold text-base text-[#0B1026]">Upload New Photo</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createGalleryImage({
            title: (formData.get("title") as string) || undefined,
            caption: (formData.get("caption") as string) || undefined,
            url: (formData.get("url") as string) || "",
            category: (formData.get("category") as string) || "Tours",
            destinationId: (formData.get("destinationId") as string) || undefined,
            featured: formData.get("featured") === "on",
          });
        }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Image URL *</label>
            <input
              type="url"
              name="url"
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Photo Title</label>
              <input
                type="text"
                name="title"
                placeholder="Crystal Waters of Dawki"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Category</label>
              <input
                type="text"
                name="category"
                defaultValue="Tours"
                placeholder="Northeast / Mountains / Waterfalls"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Assign Destination</label>
            <select
              name="destinationId"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
            >
              <option value="">No Destination (General)</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors min-h-[44px]"
          >
            Upload Photo
          </button>
        </form>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="bg-white rounded-2xl border border-[#E8ECF3] overflow-hidden p-2 shadow-sm space-y-2">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image src={img.url} alt={img.title || "Photo"} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between px-1">
              <div className="truncate">
                <h4 className="text-xs font-bold truncate text-[#0B1026]">{img.title || "Untitled"}</h4>
                <span className="text-[10px] text-[#3478F6] font-semibold">{img.category}</span>
              </div>
              <form action={async () => { "use server"; await deleteGalleryImage(img.id); }}>
                <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

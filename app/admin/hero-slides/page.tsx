import { db } from "@/lib/db";
import { createHeroSlide, deleteHeroSlide } from "@/actions";
import { Plus, Trash2, Sliders } from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminHeroSlidesPage() {
  const slides = await db.heroSlide.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Homepage Hero Slider Manager</h1>
        <p className="text-xs text-[#667085]">Add, order, and toggle active slides on the homepage hero banner.</p>
      </div>

      {/* Add Slide Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4 max-w-2xl">
        <h2 className="font-extrabold text-base text-[#0B1026]">Add New Hero Slide</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await createHeroSlide({
            title: (formData.get("title") as string) || "",
            subtitle: (formData.get("subtitle") as string) || undefined,
            badge: (formData.get("badge") as string) || undefined,
            destination: (formData.get("destination") as string) || undefined,
            startingPrice: formData.get("startingPrice") ? Number(formData.get("startingPrice")) : null,
            desktopImage: (formData.get("desktopImage") as string) || "",
            mobileImage: (formData.get("mobileImage") as string) || undefined,
            primaryBtnText: (formData.get("primaryBtnText") as string) || undefined,
            primaryBtnUrl: (formData.get("primaryBtnUrl") as string) || undefined,
            active: true,
          });
        }} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Slide Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Explore Meghalaya"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Badge Tag</label>
              <input
                type="text"
                name="badge"
                placeholder="Most Popular Group Trip"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              placeholder="Kerala to Northeast Special Departure"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Desktop Image URL *</label>
              <input
                type="url"
                name="desktopImage"
                required
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Starting Price (₹)</label>
              <input
                type="number"
                name="startingPrice"
                placeholder="14499"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors min-h-[44px]"
          >
            Create Hero Slide
          </button>
        </form>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-[#E8ECF3] p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-xl bg-gray-100 relative overflow-hidden shrink-0">
                <Image src={s.desktopImage} alt={s.title} fill className="object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#3478F6] uppercase">{s.badge || "Slide"}</span>
                <h3 className="font-bold text-sm text-[#0B1026]">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.subtitle}</p>
              </div>
            </div>

            <form action={async () => { "use server"; await deleteHeroSlide(s.id); }}>
              <button type="submit" className="text-red-600 hover:text-red-800 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

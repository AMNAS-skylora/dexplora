"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPackage, updatePackage } from "@/actions";
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export interface PackageInitialData {
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  destinationId?: string;
  tripType?: string;
  coverImage?: string;
  duration?: string;
  price?: number;
  originalPrice?: number | null;
  departureLocation?: string;
  arrivalLocation?: string;
  accommodation?: string;
  transportation?: string;
  guideInfo?: string;
  meals?: string;
  featured?: boolean;
  popular?: boolean;
  status?: string;
  displayOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: Array<{ url: string; caption?: string | null }>;
  itineraries?: Array<{ dayNumber: number; title: string; description: string; meals?: string | null; accommodation?: string | null }>;
  inclusions?: Array<{ text: string }>;
  exclusions?: Array<{ text: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

interface PackageFormProps {
  destinations: Array<{ id: string; name: string }>;
  initialData?: PackageInitialData | null;
}

export function PackageForm({ destinations, initialData }: PackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic state arrays
  const [itineraries, setItineraries] = useState<Array<{ dayNumber: number; title: string; description: string; meals?: string; accommodation?: string }>>(
    initialData?.itineraries?.length
      ? initialData.itineraries.map((it) => ({
          dayNumber: it.dayNumber,
          title: it.title,
          description: it.description,
          meals: it.meals || "",
          accommodation: it.accommodation || "",
        }))
      : [{ dayNumber: 1, title: "", description: "", meals: "", accommodation: "" }]
  );

  const [inclusions, setInclusions] = useState<string[]>(
    initialData?.inclusions?.length
      ? initialData.inclusions.map((i) => i.text)
      : [""]
  );

  const [exclusions, setExclusions] = useState<string[]>(
    initialData?.exclusions?.length
      ? initialData.exclusions.map((e) => e.text)
      : [""]
  );

  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    initialData?.faqs?.length
      ? initialData.faqs
      : [{ question: "", answer: "" }]
  );

  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; caption?: string }>>(
    initialData?.images?.length
      ? initialData.images.map((img) => ({ url: img.url, caption: img.caption || undefined }))
      : []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      shortDescription: formData.get("shortDescription") as string,
      fullDescription: formData.get("fullDescription") as string,
      destinationId: formData.get("destinationId") as string,
      tripType: formData.get("tripType") as string,
      coverImage: formData.get("coverImage") as string,
      duration: formData.get("duration") as string,
      price: Number(formData.get("price")),
      originalPrice: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null,
      departureLocation: formData.get("departureLocation") as string,
      arrivalLocation: formData.get("arrivalLocation") as string,
      accommodation: formData.get("accommodation") as string,
      transportation: formData.get("transportation") as string,
      guideInfo: formData.get("guideInfo") as string,
      meals: formData.get("meals") as string,
      featured: formData.get("featured") === "on",
      popular: formData.get("popular") === "on",
      status: (formData.get("status") as any) || "PUBLISHED",
      displayOrder: Number(formData.get("displayOrder")) || 0,
      seoTitle: (formData.get("seoTitle") as string) || undefined,
      seoDescription: (formData.get("seoDescription") as string) || undefined,
      images: galleryImages.filter((img) => img.url.trim() !== ""),
      itineraries: itineraries.filter((it) => it.title.trim() !== ""),
      inclusions: inclusions.filter((inc) => inc.trim() !== ""),
      exclusions: exclusions.filter((exc) => exc.trim() !== ""),
      faqs: faqs.filter((f) => f.question.trim() !== ""),
    };

    let result;
    if (initialData?.id) {
      result = await updatePackage(initialData.id, data);
    } else {
      result = await createPackage(data);
    }

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/packages");
      router.refresh();
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="p-2 rounded-xl bg-white border border-[#E8ECF3] hover:bg-gray-50 text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0B1026]">
            {initialData ? "Edit Package" : "Create New Package"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving Package..." : "Save Package"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl text-xs font-bold border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#0B1026]">1. Basic Package Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Package Title *</label>
            <input
              type="text"
              name="title"
              defaultValue={initialData?.title}
              required
              placeholder="e.g. Kerala to Meghalaya Group Package"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">URL Slug (Auto or Custom)</label>
            <input
              type="text"
              name="slug"
              defaultValue={initialData?.slug}
              placeholder="kerala-to-meghalaya-group-package"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Destination *</label>
            <select
              name="destinationId"
              defaultValue={initialData?.destinationId || destinations[0]?.id}
              required
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#3478F6]"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Trip Type</label>
            <input
              type="text"
              name="tripType"
              defaultValue={initialData?.tripType || "Group Trip"}
              placeholder="Group Departure / Weekend Tour"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Status</label>
            <select
              name="status"
              defaultValue={initialData?.status || "PUBLISHED"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#3478F6]"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="HIDDEN">Hidden</option>
              <option value="SOLD_OUT">Sold Out</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0B1026] mb-1">Short Description *</label>
          <input
            type="text"
            name="shortDescription"
            defaultValue={initialData?.shortDescription}
            required
            placeholder="Brief 1-2 sentence summary for cards..."
            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0B1026] mb-1">Full Description *</label>
          <textarea
            name="fullDescription"
            defaultValue={initialData?.fullDescription}
            required
            rows={5}
            placeholder="Detailed overview story of the tour..."
            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
          />
        </div>
      </div>

      {/* Pricing & Logistics */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#0B1026]">2. Pricing & Key Logistics</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              name="price"
              defaultValue={initialData?.price}
              required
              placeholder="14499"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#3478F6] focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Original Price Strikethrough (₹)</label>
            <input
              type="number"
              name="originalPrice"
              defaultValue={initialData?.originalPrice ?? undefined}
              placeholder="17999"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />

          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Duration *</label>
            <input
              type="text"
              name="duration"
              defaultValue={initialData?.duration || "6 Days / 5 Nights"}
              required
              placeholder="6 Days / 5 Nights"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Cover Image URL *</label>
            <input
              type="url"
              name="coverImage"
              defaultValue={initialData?.coverImage}
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Departure Boarding Point</label>
            <input
              type="text"
              name="departureLocation"
              defaultValue={initialData?.departureLocation || "Kerala"}
              placeholder="Kochi / Calicut / Trivandrum"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Arrival Destination</label>
            <input
              type="text"
              name="arrivalLocation"
              defaultValue={initialData?.arrivalLocation}
              required
              placeholder="Guwahati / Shillong"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Accommodation</label>
            <input
              type="text"
              name="accommodation"
              defaultValue={initialData?.accommodation || "3-Star Hotel & Resort"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Transportation</label>
            <input
              type="text"
              name="transportation"
              defaultValue={initialData?.transportation || "Train & Private AC Vehicle"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Guide Info</label>
            <input
              type="text"
              name="guideInfo"
              defaultValue={initialData?.guideInfo || "Malayali Tour Leader"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0B1026]">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initialData?.featured}
              className="w-4 h-4 rounded text-[#3478F6]"
            />
            <span>Mark as Featured on Homepage</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0B1026]">
            <input
              type="checkbox"
              name="popular"
              defaultChecked={initialData?.popular}
              className="w-4 h-4 rounded text-[#3478F6]"
            />
            <span>Mark as Popular</span>
          </label>
        </div>
      </div>

      {/* Dynamic Itinerary Builder */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#0B1026]">3. Day-by-Day Itinerary</h3>
          <button
            type="button"
            onClick={() =>
              setItineraries([
                ...itineraries,
                { dayNumber: itineraries.length + 1, title: "", description: "", meals: "", accommodation: "" },
              ])
            }
            className="bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Day</span>
          </button>
        </div>

        <div className="space-y-4">
          {itineraries.map((it, idx) => (
            <div key={idx} className="bg-[#F3F7FF] p-4 rounded-2xl border border-[#3478F6]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#3478F6]">Day {idx + 1}</span>
                {itineraries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItineraries(itineraries.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={it.title}
                onChange={(e) => {
                  const updated = [...itineraries];
                  updated[idx].title = e.target.value;
                  setItineraries(updated);
                }}
                placeholder="Day Title (e.g. Shillong to Cherrapunji Waterfalls)"
                className="w-full bg-white border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold text-[#0B1026]"
              />

              <textarea
                value={it.description}
                onChange={(e) => {
                  const updated = [...itineraries];
                  updated[idx].description = e.target.value;
                  setItineraries(updated);
                }}
                rows={3}
                placeholder="Day schedule details..."
                className="w-full bg-white border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs text-[#0B1026]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Inclusions & Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#16A36A]">Inclusions</h3>
            <button
              type="button"
              onClick={() => setInclusions([...inclusions, ""])}
              className="text-xs font-bold text-[#16A36A] hover:underline"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-2">
            {inclusions.map((inc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inc}
                  onChange={(e) => {
                    const updated = [...inclusions];
                    updated[idx] = e.target.value;
                    setInclusions(updated);
                  }}
                  placeholder="e.g. Daily Breakfast & Dinner"
                  className="flex-1 bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium"
                />
                {inclusions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setInclusions(inclusions.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exclusions */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#DC2626]">Exclusions</h3>
            <button
              type="button"
              onClick={() => setExclusions([...exclusions, ""])}
              className="text-xs font-bold text-[#DC2626] hover:underline"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-2">
            {exclusions.map((exc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={exc}
                  onChange={(e) => {
                    const updated = [...exclusions];
                    updated[idx] = e.target.value;
                    setExclusions(updated);
                  }}
                  placeholder="e.g. Lunch meals and personal snacks"
                  className="flex-1 bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium"
                />
                {exclusions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setExclusions(exclusions.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3478F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl text-sm shadow-xl transition-all min-h-[48px]"
      >
        {loading ? "Saving Package..." : "Save Package"}
      </button>
    </form>
  );
}

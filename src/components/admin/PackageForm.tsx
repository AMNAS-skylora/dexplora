"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPackage, updatePackage } from "@/actions";
import { Plus, Trash2, Save, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PackageCoverUploader } from "./PackageCoverUploader";
import { DestinationSearchSelector, DestinationOption } from "./DestinationSearchSelector";
import { ItineraryDayUploader } from "./ItineraryDayUploader";

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
  itineraries?: Array<{ dayNumber: number; title: string; description: string; imageUrl?: string | null; meals?: string | null; accommodation?: string | null }>;
  inclusions?: Array<{ text: string }>;
  exclusions?: Array<{ text: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

interface FormErrors {
  title?: string;
  destinationId?: string;
  days?: string;
  nights?: string;
  coverImage?: string;
}

interface PackageFormProps {
  destinations: DestinationOption[];
  initialData?: PackageInitialData | null;
}

// Helper to parse "6 Days / 5 Nights" string into { days, nights }
function parseDurationString(durationStr?: string | null): { days: number; nights: number } {
  if (!durationStr) return { days: 6, nights: 5 };
  const daysMatch = durationStr.match(/(\d+)\s*Days?/i);
  const nightsMatch = durationStr.match(/(\d+)\s*Nights?/i);

  const days = daysMatch ? parseInt(daysMatch[1], 10) : 6;
  const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : Math.max(days - 1, 0);

  return { days, nights };
}

export function PackageForm({ destinations, initialData }: PackageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  // Basic Form States
  const [title, setTitle] = useState(initialData?.title || "");
  const [destinationId, setDestinationId] = useState(initialData?.destinationId || destinations[0]?.id || "");

  // Duration State (Days & Nights)
  const initialDuration = parseDurationString(initialData?.duration);
  const [days, setDays] = useState<number>(initialDuration.days);
  const [nights, setNights] = useState<number>(initialDuration.nights);
  const [userEditedNights, setUserEditedNights] = useState<boolean>(false);

  // Cover image state
  const [coverImage, setCoverImage] = useState<string>(initialData?.coverImage || "");
  const [uploadingCover, setUploadingCover] = useState(false);

  // Auto-calculate nights when days changes if user has not manually edited nights
  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    if (!userEditedNights) {
      setNights(Math.max(newDays - 1, 0));
    }
    if (fieldErrors.days) {
      setFieldErrors((prev) => ({ ...prev, days: undefined }));
    }
  };

  const handleNightsChange = (newNights: number) => {
    setUserEditedNights(true);
    setNights(newNights);
    if (fieldErrors.nights) {
      setFieldErrors((prev) => ({ ...prev, nights: undefined }));
    }
  };

  // Dynamic Itinerary state with day images
  const [itineraries, setItineraries] = useState<Array<{ dayNumber: number; title: string; description: string; imageUrl?: string }>>(
    initialData?.itineraries?.length
      ? initialData.itineraries.map((it, idx) => ({
          dayNumber: idx + 1,
          title: it.title,
          description: it.description,
          imageUrl: it.imageUrl || "",
        }))
      : [{ dayNumber: 1, title: "", description: "", imageUrl: "" }]
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

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!title.trim()) {
      errors.title = "Package title is required.";
    }

    if (!destinationId) {
      errors.destinationId = "Please select a destination.";
    }

    if (!days || days < 1) {
      errors.days = "Days must be at least 1.";
    }

    if (nights < 0) {
      errors.nights = "Nights cannot be negative.";
    }

    if (!coverImage || !coverImage.trim()) {
      errors.coverImage = "Cover image is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const generatedDuration = `${days} Days / ${nights} Nights`;

    const data = {
      title: title.trim(),
      slug: initialData?.slug || undefined, // Server Actions auto-generate unique slug if undefined
      shortDescription: formData.get("shortDescription") as string,
      fullDescription: formData.get("fullDescription") as string,
      destinationId,
      tripType: "Group Departure", // Preserved as neutral default for legacy schema compatibility
      coverImage: coverImage.trim(),
      duration: generatedDuration,
      price: Number(formData.get("price")),
      originalPrice: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null,
      departureLocation: (formData.get("departureLocation") as string) || "Kerala",
      arrivalLocation: formData.get("arrivalLocation") as string,
      accommodation: (formData.get("accommodation") as string) || "3-Star Hotel & Resort",
      transportation: (formData.get("transportation") as string) || "Private Vehicle",
      guideInfo: (formData.get("guideInfo") as string) || "Tour Leader",
      meals: (formData.get("meals") as string) || "",
      featured: formData.get("featured") === "on",
      popular: formData.get("popular") === "on",
      status: (formData.get("status") as any) || "PUBLISHED",
      displayOrder: Number(formData.get("displayOrder")) || 0,
      seoTitle: (formData.get("seoTitle") as string) || undefined,
      seoDescription: (formData.get("seoDescription") as string) || undefined,
      images: galleryImages.filter((img) => img.url.trim() !== ""),
      itineraries: itineraries
        .filter((it) => it.title.trim() !== "")
        .map((it, idx) => ({
          dayNumber: idx + 1,
          title: it.title,
          description: it.description,
          imageUrl: it.imageUrl || null,
        })),
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

  const addItineraryDay = () => {
    setItineraries((prev) => [
      ...prev,
      { dayNumber: prev.length + 1, title: "", description: "", imageUrl: "" },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    setItineraries((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((it, idx) => ({ ...it, dayNumber: idx + 1 }))
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="p-2 rounded-xl bg-white border border-[#E8ECF3] hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0B1026]">
            {initialData ? "Edit Package" : "Create New Package"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={loading || uploadingCover}
          className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {uploadingCover ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Uploading image...</span>
            </>
          ) : loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Package...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Package</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Package Information */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#0B1026]">1. Basic Package Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Package Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Kerala to Meghalaya Group Package"
              className={`w-full bg-[#F3F7FF] border rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors outline-none min-h-[44px] ${
                fieldErrors.title
                  ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-500/20"
                  : "border-[#E8ECF3] text-[#0B1026] focus:border-[#3478F6]"
              }`}
            />
            {fieldErrors.title && (
              <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.title}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Status</label>
            <select
              name="status"
              defaultValue={initialData?.status || "PUBLISHED"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] focus:outline-none focus:border-[#3478F6] min-h-[44px]"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="HIDDEN">Hidden</option>
              <option value="SOLD_OUT">Sold Out</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Searchable Destination Selector */}
        <DestinationSearchSelector
          destinations={destinations}
          value={destinationId}
          onChange={(id) => {
            setDestinationId(id);
            if (fieldErrors.destinationId) {
              setFieldErrors((prev) => ({ ...prev, destinationId: undefined }));
            }
          }}
          error={fieldErrors.destinationId}
        />

        <div>
          <label className="block text-xs font-bold text-[#0B1026] mb-1">Short Description *</label>
          <input
            type="text"
            name="shortDescription"
            defaultValue={initialData?.shortDescription}
            required
            placeholder="Brief 1-2 sentence summary for package cards..."
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

      {/* 2. Pricing & Key Logistics */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-5">
        <h3 className="font-extrabold text-base text-[#0B1026]">2. Pricing & Key Logistics</h3>

        {/* Row 1: Selling Price, Original Price, Days, Nights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              name="price"
              defaultValue={initialData?.price}
              required
              placeholder="14499"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#3478F6] focus:outline-none focus:border-[#3478F6] min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Original Price Strikethrough (₹)</label>
            <input
              type="number"
              name="originalPrice"
              defaultValue={initialData?.originalPrice ?? undefined}
              placeholder="17999"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6] min-h-[44px]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Days *</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              placeholder="6"
              className={`w-full bg-[#F3F7FF] border rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors outline-none min-h-[44px] ${
                fieldErrors.days
                  ? "border-red-500 bg-red-50/50 text-red-900"
                  : "border-[#E8ECF3] text-[#0B1026] focus:border-[#3478F6]"
              }`}
            />
            {fieldErrors.days && (
              <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.days}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Nights *</label>
            <input
              type="number"
              min="0"
              value={nights}
              onChange={(e) => handleNightsChange(Number(e.target.value))}
              placeholder="5"
              className={`w-full bg-[#F3F7FF] border rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors outline-none min-h-[44px] ${
                fieldErrors.nights
                  ? "border-red-500 bg-red-50/50 text-red-900"
                  : "border-[#E8ECF3] text-[#0B1026] focus:border-[#3478F6]"
              }`}
            />
            {fieldErrors.nights && (
              <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.nights}</span>
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Cover Image Uploader (Full Width) */}
        <div className="pt-2">
          <PackageCoverUploader
            value={coverImage}
            onChange={(url) => {
              setCoverImage(url);
              if (fieldErrors.coverImage) {
                setFieldErrors((prev) => ({ ...prev, coverImage: undefined }));
              }
            }}
            onUploadingChange={setUploadingCover}
            error={fieldErrors.coverImage}
          />
        </div>

        {/* Row 3: Departure Boarding Point & Arrival Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Departure Boarding Point</label>
            <input
              type="text"
              name="departureLocation"
              defaultValue={initialData?.departureLocation || "Kerala"}
              placeholder="Kochi / Calicut / Trivandrum"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6] min-h-[44px]"
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
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3478F6] min-h-[44px]"
            />
          </div>
        </div>

        {/* Row 4: Accommodation, Transportation, Guide Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Accommodation</label>
            <input
              type="text"
              name="accommodation"
              defaultValue={initialData?.accommodation || "3-Star Hotel & Resort"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Transportation</label>
            <input
              type="text"
              name="transportation"
              defaultValue={initialData?.transportation || "Train & Private AC Vehicle"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Guide Info</label>
            <input
              type="text"
              name="guideInfo"
              defaultValue={initialData?.guideInfo || "Malayali Tour Leader"}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium min-h-[44px]"
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

      {/* 3. Dynamic Day-by-Day Itinerary Builder */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#0B1026]">3. Day-by-Day Itinerary</h3>
          <button
            type="button"
            onClick={addItineraryDay}
            className="bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Day</span>
          </button>
        </div>

        <div className="space-y-5">
          {itineraries.map((it, idx) => (
            <div key={idx} className="bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E8ECF3] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#3478F6] uppercase tracking-wider bg-[#3478F6]/10 px-2.5 py-1 rounded-lg">
                  Day {it.dayNumber}
                </span>
                {itineraries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove Day</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Day {it.dayNumber} Title *</label>
                  <input
                    type="text"
                    value={it.title}
                    onChange={(e) => {
                      const updated = [...itineraries];
                      updated[idx].title = e.target.value;
                      setItineraries(updated);
                    }}
                    placeholder="e.g. Shillong to Cherrapunji Waterfalls & Caves"
                    className="w-full bg-white border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Day Description</label>
                  <textarea
                    value={it.description}
                    onChange={(e) => {
                      const updated = [...itineraries];
                      updated[idx].description = e.target.value;
                      setItineraries(updated);
                    }}
                    rows={3}
                    placeholder="Detailed schedule of places visited, activities and highlights..."
                    className="w-full bg-white border border-[#E8ECF3] rounded-xl p-3 text-xs text-[#0B1026] outline-none focus:border-[#3478F6]"
                  />
                </div>

                {/* Day Image Uploader */}
                <ItineraryDayUploader
                  dayNumber={it.dayNumber}
                  value={it.imageUrl}
                  onChange={(url) => {
                    const updated = [...itineraries];
                    updated[idx].imageUrl = url;
                    setItineraries(updated);
                  }}
                />
              </div>
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
              className="text-xs font-bold text-[#16A36A] hover:underline cursor-pointer"
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
                    className="text-red-500 hover:text-red-700 cursor-pointer"
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
              className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
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
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={loading || uploadingCover}
        className="w-full bg-[#3478F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl text-sm shadow-xl transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {uploadingCover ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Uploading image...</span>
          </>
        ) : loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Saving Package...</span>
          </>
        ) : (
          <span>Save Package</span>
        )}
      </button>
    </form>
  );
}

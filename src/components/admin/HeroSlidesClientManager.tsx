"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDate, formatPrice, getHeroImage } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Edit2,
  Sliders,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowUp,
  ArrowDown,
  Calendar,
  Sparkles,
  CheckCircle2,
  Search,
  X,
  ExternalLink,
  Tag,
  Loader2,
} from "lucide-react";
import { CustomHeroUploader } from "./CustomHeroUploader";

export interface UpcomingEventOption {
  id: string;
  packageId?: string | null;
  packageTitle: string;
  batchName: string;
  destination: string;
  startDate: string | Date;
  endDate: string | Date;
  duration: string;
  coverImage?: string | null;
  offerPrice: number;
  realPrice?: number | null;
  availableSeats: number;
  totalSeats: number;
  status: string;
}

export interface HeroSlideRecord {
  id: string;
  type: "EVENT" | "CUSTOM";
  eventId?: string | null;
  title: string;
  badgeTag?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  startingPrice?: number | null;
  realPrice?: number | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  isActive: boolean;
  sortOrder: number;
  event?: UpcomingEventOption | null;
}

interface HeroSlidesClientManagerProps {
  initialSlides: any[];
  upcomingEvents: UpcomingEventOption[];
}

export function HeroSlidesClientManager({
  initialSlides,
  upcomingEvents,
}: HeroSlidesClientManagerProps) {
  const router = useRouter();

  const [slides, setSlides] = useState<HeroSlideRecord[]>(() =>
    initialSlides.map((item: any) => ({
      id: item.id,
      type: item.type || (item.eventId ? "EVENT" : "CUSTOM"),
      eventId: item.eventId || null,
      title: item.title || "",
      badgeTag: item.badgeTag || item.badge || "",
      subtitle: item.subtitle || "",
      imageUrl: item.imageUrl || item.desktopImage || "",
      imagePublicId: item.imagePublicId || "",
      startDate: item.startDate || null,
      endDate: item.endDate || null,
      startingPrice: item.startingPrice ?? null,
      realPrice: item.realPrice ?? null,
      ctaText: item.ctaText || item.primaryBtnText || "",
      ctaLink: item.ctaLink || item.primaryBtnUrl || "",
      isActive: item.isActive ?? item.active ?? true,
      sortOrder: item.sortOrder ?? item.displayOrder ?? 0,
      event: item.event || null,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"EVENT" | "CUSTOM">("EVENT");
  const [editingSlide, setEditingSlide] = useState<HeroSlideRecord | null>(null);

  // Mode 1: Event Selection
  const [eventSearch, setEventSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form Override State (Mode 1 & Mode 2)
  const [formTitle, setFormTitle] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImagePublicId, setFormImagePublicId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStartingPrice, setFormStartingPrice] = useState<number | "">("");
  const [formRealPrice, setFormRealPrice] = useState<number | "">("");
  const [formCtaText, setFormCtaText] = useState("");
  const [formCtaLink, setFormCtaLink] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview & Delete Modals
  const [previewSlide, setPreviewSlide] = useState<HeroSlideRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlideRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshSlides = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to reload hero slides");

      const data = await res.json();
      const mapped = data.map((item: any) => ({
        id: item.id,
        type: item.type || (item.eventId ? "EVENT" : "CUSTOM"),
        eventId: item.eventId || null,
        title: item.title || "",
        badgeTag: item.badgeTag || item.badge || "",
        subtitle: item.subtitle || "",
        imageUrl: item.imageUrl || item.desktopImage || "",
        imagePublicId: item.imagePublicId || "",
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        startingPrice: item.startingPrice ?? null,
        realPrice: item.realPrice ?? null,
        ctaText: item.ctaText || item.primaryBtnText || "",
        ctaLink: item.ctaLink || item.primaryBtnUrl || "",
        isActive: item.isActive ?? item.active ?? true,
        sortOrder: item.sortOrder ?? item.displayOrder ?? 0,
        event: item.event || null,
      }));
      setSlides(mapped);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Error updating hero slides list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSlide(null);
    setMode("EVENT");
    setSelectedEventId(null);
    setFormTitle("");
    setFormBadge("");
    setFormSubtitle("");
    setFormImageUrl("");
    setFormImagePublicId("");
    setFormStartDate("");
    setFormEndDate("");
    setFormStartingPrice("");
    setFormRealPrice("");
    setFormCtaText("");
    setFormCtaLink("");
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlideRecord) => {
    setEditingSlide(slide);
    const slideMode = slide.type || (slide.eventId ? "EVENT" : "CUSTOM");
    setMode(slideMode);
    setSelectedEventId(slide.eventId || null);
    setFormTitle(slide.title || "");
    setFormBadge(slide.badgeTag || "");
    setFormSubtitle(slide.subtitle || "");
    setFormImageUrl(slide.imageUrl || "");
    setFormImagePublicId(slide.imagePublicId || "");
    const safeFormatDate = (val: any) => {
      if (!val) return "";
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      } catch {
        return "";
      }
    };
    setFormStartDate(safeFormatDate(slide.startDate));
    setFormEndDate(safeFormatDate(slide.endDate));
    setFormStartingPrice(slide.startingPrice !== null && slide.startingPrice !== undefined ? slide.startingPrice : "");
    setFormRealPrice(slide.realPrice !== null && slide.realPrice !== undefined ? slide.realPrice : "");
    setFormCtaText(slide.ctaText || "");
    setFormCtaLink(slide.ctaLink || "");
    setFormIsActive(slide.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === "EVENT") {
      if (!selectedEventId) {
        setFormError("Please select an Upcoming Trip event.");
        return;
      }
    } else {
      if (!formTitle.trim()) {
        setFormError("Slide Title is required for custom slide.");
        return;
      }
      if (!formImageUrl.trim()) {
        setFormError("Banner Image is required for custom slide.");
        return;
      }
    }

    setIsSaving(true);

    const payload = {
      type: mode,
      eventId: mode === "EVENT" ? selectedEventId : null,
      title: formTitle.trim() || undefined,
      badgeTag: formBadge.trim() || undefined,
      subtitle: formSubtitle.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      imagePublicId: formImagePublicId.trim() || undefined,
      startDate: formStartDate || undefined,
      endDate: formEndDate || undefined,
      startingPrice: formStartingPrice !== "" ? Number(formStartingPrice) : undefined,
      realPrice: formRealPrice !== "" ? Number(formRealPrice) : undefined,
      ctaText: formCtaText.trim() || undefined,
      ctaLink: formCtaLink.trim() || undefined,
      isActive: formIsActive,
    };

    try {
      const url = editingSlide ? `/api/admin/hero-slides/${editingSlide.id}` : "/api/admin/hero-slides";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save hero slide.");

      setIsModalOpen(false);
      await refreshSlides();
    } catch (err: any) {
      setFormError(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlideRecord) => {
    const newStatus = !slide.isActive;
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isActive: newStatus } : s)));

    try {
      await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      router.refresh();
    } catch (err) {
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isActive: slide.isActive } : s)));
    }
  };

  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Re-assign sortOrder
    const updated = newSlides.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSlides(updated);

    // Save orders to server
    try {
      await Promise.all(
        updated.map((s) =>
          fetch(`/api/admin/hero-slides/${s.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: s.sortOrder }),
          })
        )
      );
      router.refresh();
    } catch (err) {
      console.error("Failed to persist slide reorder:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/hero-slides/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete slide.");
      }

      setDeleteTarget(null);
      await refreshSlides();
    } catch (err: any) {
      alert(err?.message || "Failed to delete slide.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Upcoming Events for Mode 1
  const filteredEvents = upcomingEvents.filter((ev) => {
    const q = eventSearch.toLowerCase();
    return (
      ev.packageTitle.toLowerCase().includes(q) ||
      ev.batchName.toLowerCase().includes(q) ||
      ev.destination.toLowerCase().includes(q)
    );
  });

  const selectedEvent = upcomingEvents.find((ev) => ev.id === selectedEventId);
  const addedEventIds = new Set(slides.filter((s) => s.type === "EVENT" && s.eventId).map((s) => s.eventId));

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-4 py-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#3478F6] font-bold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Homepage Content Rotation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B1026]">Hero Slides Manager</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live homepage hero banners via Upcoming Trips or Custom Promotions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[46px] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {/* Hero Rotation Cards List */}
      {slides.length === 0 ? (
        <div className="bg-white border border-[#E8ECF3] rounded-3xl p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0B1026]">No Hero Slides Active</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Add your first Hero Slide from an Upcoming Event or create a Custom Promo banner.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, idx) => {
            const isEvent = slide.type === "EVENT";
            const linkedEv = slide.event || upcomingEvents.find((e) => e.id === slide.eventId);

            // Compute display values
            const title = isEvent ? (slide.title || linkedEv?.packageTitle || "Group Trip") : (slide.title || "Custom Banner");
            const badge = slide.badgeTag || (isEvent ? "UPCOMING TRIP" : "PROMOTION");
            const subtitle = isEvent
              ? (slide.subtitle || (linkedEv ? `${formatDate(linkedEv.startDate)} – ${formatDate(linkedEv.endDate)} • ${linkedEv.duration}` : ""))
              : slide.subtitle;
            const img = getHeroImage(slide) || getHeroImage(linkedEv) || "";
            const offerPrice = isEvent ? (linkedEv?.offerPrice || slide.startingPrice) : slide.startingPrice;
            const realPrice = isEvent ? (linkedEv?.realPrice || slide.realPrice) : slide.realPrice;

            return (
              <div
                key={slide.id}
                className={`bg-white border rounded-3xl p-4 sm:p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  slide.isActive ? "border-[#E8ECF3]" : "border-gray-200 opacity-60 bg-gray-50/50"
                }`}
              >
                {/* Thumbnail Image & Type Badge */}
                <div className="relative w-full md:w-48 aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shrink-0 border border-[#E8ECF3]">
                  {img ? (
                    <Image src={img} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 220px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">No Image</div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs ${
                        isEvent ? "bg-[#3478F6]" : "bg-purple-600"
                      }`}
                    >
                      {isEvent ? "EVENT" : "CUSTOM"}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    #{idx + 1}
                  </div>
                </div>

                {/* Info & Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#3478F6]/10 text-[#3478F6] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                        slide.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B1026] truncate">{title}</h3>

                  {subtitle && <p className="text-xs text-gray-500 font-medium line-clamp-1">{subtitle}</p>}

                  {/* Price */}
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    {offerPrice ? (
                      <span className="font-extrabold text-[#3478F6] text-sm">{formatPrice(offerPrice)}</span>
                    ) : (
                      <span className="text-gray-400 font-medium">No price tag</span>
                    )}

                    {realPrice && <span className="text-gray-400 line-through font-semibold">{formatPrice(realPrice)}</span>}
                  </div>
                </div>

                {/* Actions & Reordering */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E8ECF3]">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 bg-[#F3F7FF] p-1 rounded-xl border border-[#E8ECF3] justify-center">
                    <button
                      onClick={() => handleMoveOrder(idx, "UP")}
                      disabled={idx === 0}
                      className="p-1 text-gray-600 hover:text-[#3478F6] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-gray-500 px-1">Order</span>
                    <button
                      onClick={() => handleMoveOrder(idx, "DOWN")}
                      disabled={idx === slides.length - 1}
                      className="p-1 text-gray-600 hover:text-[#3478F6] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setPreviewSlide(slide)}
                      className="px-3 py-2 bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Live Preview"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => handleToggleActive(slide)}
                      className="p-2 text-gray-600 hover:text-[#3478F6] bg-gray-50 hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer"
                      title={slide.isActive ? "Deactivate" : "Activate"}
                    >
                      {slide.isActive ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(slide)}
                      className="p-2 text-gray-600 hover:text-[#3478F6] bg-gray-50 hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(slide)}
                      className="p-2 text-red-500 hover:text-red-700 bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Hero Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-[#E8ECF3] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0B1026]">
                  {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                </h2>
                <p className="text-xs text-gray-500">Choose creation mode: Existing Event or Custom Slide.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Segmented Control */}
            {!editingSlide && (
              <div className="bg-[#F3F7FF] p-1.5 rounded-2xl border border-[#E8ECF3] grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("EVENT")}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === "EVENT" ? "bg-[#3478F6] text-white shadow-sm" : "text-gray-600 hover:text-[#0B1026]"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Use Existing Event</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("CUSTOM")}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === "CUSTOM" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 hover:text-[#0B1026]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Custom Slide</span>
                </button>
              </div>
            )}

            {formError && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* MODE 1: EXISTING EVENT SELECTION */}
              {mode === "EVENT" && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3478F6]">1. Select Upcoming Trip Event *</h3>

                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="Search upcoming events by title or destination..."
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 border border-[#E8ECF3] rounded-2xl p-2 bg-[#F8FAFC]">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((ev) => {
                        const isAlreadyAdded = addedEventIds.has(ev.id) && ev.id !== editingSlide?.eventId;
                        const isSelected = selectedEventId === ev.id;

                        return (
                          <div
                            key={ev.id}
                            onClick={() => !isAlreadyAdded && setSelectedEventId(ev.id)}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? "bg-[#3478F6]/10 border-[#3478F6] ring-2 ring-[#3478F6]/20"
                                : isAlreadyAdded
                                ? "bg-gray-100 opacity-60 cursor-not-allowed border-gray-200"
                                : "bg-white border-[#E8ECF3] hover:border-[#3478F6]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-gray-200 relative overflow-hidden shrink-0">
                                {getHeroImage(ev) ? (
                                  <Image src={getHeroImage(ev)!} alt={ev.packageTitle} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold">No Image</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-xs text-[#0B1026] truncate">{ev.packageTitle}</h4>
                                <p className="text-[11px] text-gray-500 font-medium truncate">
                                  {ev.batchName} • {formatDate(ev.startDate)} • <strong className="text-[#3478F6]">{formatPrice(ev.offerPrice)}</strong>
                                </p>
                              </div>
                            </div>

                            {isAlreadyAdded ? (
                              <span className="text-[10px] font-extrabold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full shrink-0">
                                Already in Hero
                              </span>
                            ) : isSelected ? (
                              <span className="text-xs font-extrabold text-[#3478F6] flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-[#3478F6]" /> Selected
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-gray-500 hover:text-[#3478F6] shrink-0">
                                Select
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400 py-4 text-center">No matching upcoming events found.</p>
                    )}
                  </div>

                  {/* Optional Overrides for Event Slide */}
                  {selectedEvent && (
                    <div className="pt-2 space-y-3">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3478F6]">2. Optional Event Overrides</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Custom Badge Tag</label>
                          <input
                            type="text"
                            value={formBadge}
                            onChange={(e) => setFormBadge(e.target.value)}
                            placeholder="UPCOMING TRIP (Default)"
                            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Custom CTA Text</label>
                          <input
                            type="text"
                            value={formCtaText}
                            onChange={(e) => setFormCtaText(e.target.value)}
                            placeholder="View Trip (Default)"
                            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: CUSTOM SLIDE FORM */}
              {mode === "CUSTOM" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0B1026] mb-1">Slide Title *</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      placeholder="e.g. Onam Special Group Tour Offer"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        placeholder="PROMOTION / FESTIVAL SALE"
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">Subtitle Tagline</label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="Brief offer description..."
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                      />
                    </div>
                  </div>

                  {/* Custom Hero Image Upload */}
                  <CustomHeroUploader
                    value={formImageUrl}
                    onChange={(url, publicId) => {
                      setFormImageUrl(url);
                      if (publicId) setFormImagePublicId(publicId);
                    }}
                  />

                  {/* Dates & Prices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">Start Date <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">End Date <span className="text-gray-400 font-normal">(Optional Expiry)</span></label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">Starting Offer Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formStartingPrice}
                        onChange={(e) => setFormStartingPrice(e.target.value ? Number(e.target.value) : "")}
                        placeholder="5699"
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold text-[#3478F6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">Real MRP Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formRealPrice}
                        onChange={(e) => setFormRealPrice(e.target.value ? Number(e.target.value) : "")}
                        placeholder="7999"
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="Explore Packages"
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1026] mb-1">CTA Button URL Link</label>
                      <input
                        type="text"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        placeholder="/packages"
                        className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8ECF3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8ECF3] text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[42px] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{editingSlide ? "Update Hero Slide" : "Add to Hero Rotation"}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#050A24] text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-white/10 relative overflow-hidden">
            <button
              onClick={() => setPreviewSlide(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="bg-[#3478F6] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              {previewSlide.badgeTag || (previewSlide.type === "EVENT" ? "UPCOMING TRIP" : "PROMOTION")}
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {previewSlide.title || previewSlide.event?.packageTitle}
            </h2>

            <p className="text-xs text-gray-300 font-medium">
              {previewSlide.subtitle || (previewSlide.event ? `${formatDate(previewSlide.event.startDate)} – ${formatDate(previewSlide.event.endDate)} • ${previewSlide.event.duration}` : "")}
            </p>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-xs text-gray-400">Starting from</span>
              <span className="text-xl font-extrabold text-[#3478F6]">
                {formatPrice(previewSlide.startingPrice || previewSlide.event?.offerPrice || 14499)}
              </span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setPreviewSlide(null)}
                className="bg-white text-gray-900 font-bold px-5 py-2 rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-3">
              <h2 className="text-base font-extrabold text-[#0B1026]">Confirm Remove Slide</h2>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              Are you sure you want to remove this hero slide?
              {deleteTarget.type === "EVENT"
                ? " (Note: Deleting an Event Hero Slide removes only the Hero relation. Upcoming Trip Events and Packages will NOT be deleted)."
                : " (Note: Custom hero image asset will be cleaned up safely)."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Remove</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

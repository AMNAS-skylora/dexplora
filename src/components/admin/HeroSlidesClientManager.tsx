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
  Timer,
  Copy,
  Clock,
  PlusCircle,
  Package,
  Video,
  ListPlus,
  Check,
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

export interface PackageOption {
  id: string;
  title: string;
  slug: string;
  price?: number | null;
  originalPrice?: number | null;
  realPrice?: number | null;
  coverImage?: string | null;
  destination?: { name: string } | null;
  destinationName?: string | null;
}

export interface HeroSlideRecord {
  id: string;
  type: "EVENT" | "CUSTOM" | "SCHEDULED_OFFER";
  eventId?: string | null;
  packageId?: string | null;
  title: string;
  badgeTag?: string | null;
  subtitle?: string | null;
  destination?: string | null;
  imageUrl?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  videoUrl?: string | null;
  imagePublicId?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  startingPrice?: number | null;
  realPrice?: number | null;
  currency?: string | null;
  discountLabel?: string | null;
  offerPoints?: string[];
  ctaText?: string | null;
  ctaLink?: string | null;
  openInNewTab?: boolean;
  showCountdown?: boolean;
  showPrice?: boolean;
  showPoints?: boolean;
  showCTA?: boolean;
  textAlignment?: "left" | "center" | "right";
  overlayStrength?: "light" | "medium" | "dark" | "heavy";
  isActive: boolean;
  sortOrder: number;
  event?: UpcomingEventOption | null;
  package?: PackageOption | null;
}

export interface DestinationOption {
  id: string;
  name: string;
  slug: string;
}

interface HeroSlidesClientManagerProps {
  initialSlides: any[];
  upcomingEvents: UpcomingEventOption[];
  destinations?: DestinationOption[];
  packages?: PackageOption[];
}

export function getSlideStatus(slide: HeroSlideRecord): "SCHEDULED" | "ACTIVE" | "EXPIRED" | "DISABLED" {
  if (!slide.isActive) return "DISABLED";
  if (slide.type === "SCHEDULED_OFFER") {
    if (!slide.startDate || !slide.endDate) return "ACTIVE";
    const now = new Date().getTime();
    const start = new Date(slide.startDate).getTime();
    const end = new Date(slide.endDate).getTime();
    if (now < start) return "SCHEDULED";
    if (now >= end) return "EXPIRED";
    return "ACTIVE";
  }
  if (slide.endDate) {
    const now = new Date().getTime();
    const end = new Date(slide.endDate).getTime();
    if (now >= end) return "EXPIRED";
  }
  return "ACTIVE";
}

export function getRemainingTimeString(endDate: string | Date | null | undefined): string | null {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function HeroSlidesClientManager({
  initialSlides,
  upcomingEvents,
  destinations = [],
  packages = [],
}: HeroSlidesClientManagerProps) {
  const router = useRouter();

  const [slides, setSlides] = useState<HeroSlideRecord[]>(() =>
    initialSlides.map((item: any) => ({
      id: item.id,
      type: item.type || (item.eventId ? "EVENT" : "CUSTOM"),
      eventId: item.eventId || null,
      packageId: item.packageId || null,
      title: item.title || "",
      badgeTag: item.badgeTag || item.badge || "",
      subtitle: item.subtitle || "",
      destination: item.destination?.name || (typeof item.destination === "string" ? item.destination : "") || "",
      imageUrl: item.imageUrl || item.desktopImage || "",
      desktopImage: item.desktopImage || item.imageUrl || "",
      mobileImage: item.mobileImage || "",
      videoUrl: item.videoUrl || "",
      imagePublicId: item.imagePublicId || "",
      startDate: item.startDate || null,
      endDate: item.endDate || null,
      startingPrice: item.startingPrice ?? null,
      realPrice: item.realPrice ?? null,
      currency: item.currency || "INR",
      discountLabel: item.discountLabel || "",
      offerPoints: Array.isArray(item.offerPoints) ? item.offerPoints : [],
      ctaText: item.ctaText || item.primaryBtnText || "",
      ctaLink: item.ctaLink || item.primaryBtnUrl || "",
      openInNewTab: Boolean(item.openInNewTab),
      showCountdown: item.showCountdown !== undefined ? Boolean(item.showCountdown) : true,
      showPrice: item.showPrice !== undefined ? Boolean(item.showPrice) : true,
      showPoints: item.showPoints !== undefined ? Boolean(item.showPoints) : true,
      showCTA: item.showCTA !== undefined ? Boolean(item.showCTA) : true,
      textAlignment: item.textAlignment || "left",
      overlayStrength: item.overlayStrength || "medium",
      isActive: item.isActive ?? item.active ?? true,
      sortOrder: item.sortOrder ?? item.displayOrder ?? 0,
      event: item.event || null,
      package: item.package || null,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"EVENT" | "CUSTOM" | "SCHEDULED_OFFER">("EVENT");
  const [editingSlide, setEditingSlide] = useState<HeroSlideRecord | null>(null);

  // Mode 1: Event Selection
  const [eventSearch, setEventSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Mode 3: Package Search & Selection
  const [packageSearch, setPackageSearch] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMobileImageUrl, setFormMobileImageUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formImagePublicId, setFormImagePublicId] = useState("");

  // Schedule Dates (Date + Time strings for inputs)
  const [formStartDateTime, setFormStartDateTime] = useState("");
  const [formEndDateTime, setFormEndDateTime] = useState("");

  // Prices & Currency
  const [formStartingPrice, setFormStartingPrice] = useState<number | "">("");
  const [formRealPrice, setFormRealPrice] = useState<number | "">("");
  const [formCurrency, setFormCurrency] = useState("INR");
  const [formCustomCurrency, setFormCustomCurrency] = useState("");
  const [formDiscountLabel, setFormDiscountLabel] = useState("");

  // Highlights
  const [formOfferPoints, setFormOfferPoints] = useState<string[]>([""]);

  // CTA & Display Options
  const [formCtaText, setFormCtaText] = useState("");
  const [formCtaLink, setFormCtaLink] = useState("");
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(false);
  const [formShowCountdown, setFormShowCountdown] = useState(true);
  const [formShowPrice, setFormShowPrice] = useState(true);
  const [formShowPoints, setFormShowPoints] = useState(true);
  const [formShowCTA, setFormShowCTA] = useState(true);
  const [formTextAlignment, setFormTextAlignment] = useState<"left" | "center" | "right">("left");
  const [formOverlayStrength, setFormOverlayStrength] = useState<"light" | "medium" | "dark" | "heavy">("medium");

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
        packageId: item.packageId || null,
        title: item.title || "",
        badgeTag: item.badgeTag || item.badge || "",
        subtitle: item.subtitle || "",
        destination: item.destination?.name || (typeof item.destination === "string" ? item.destination : "") || "",
        imageUrl: item.imageUrl || item.desktopImage || "",
        desktopImage: item.desktopImage || item.imageUrl || "",
        mobileImage: item.mobileImage || "",
        videoUrl: item.videoUrl || "",
        imagePublicId: item.imagePublicId || "",
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        startingPrice: item.startingPrice ?? null,
        realPrice: item.realPrice ?? null,
        currency: item.currency || "INR",
        discountLabel: item.discountLabel || "",
        offerPoints: Array.isArray(item.offerPoints) ? item.offerPoints : [],
        ctaText: item.ctaText || item.primaryBtnText || "",
        ctaLink: item.ctaLink || item.primaryBtnUrl || "",
        openInNewTab: Boolean(item.openInNewTab),
        showCountdown: item.showCountdown !== undefined ? Boolean(item.showCountdown) : true,
        showPrice: item.showPrice !== undefined ? Boolean(item.showPrice) : true,
        showPoints: item.showPoints !== undefined ? Boolean(item.showPoints) : true,
        showCTA: item.showCTA !== undefined ? Boolean(item.showCTA) : true,
        textAlignment: item.textAlignment || "left",
        overlayStrength: item.overlayStrength || "medium",
        isActive: item.isActive ?? item.active ?? true,
        sortOrder: item.sortOrder ?? item.displayOrder ?? 0,
        event: item.event || null,
        package: item.package || null,
      }));
      setSlides(mapped);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Error updating hero slides list.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormState = () => {
    setEditingSlide(null);
    setMode("EVENT");
    setSelectedEventId(null);
    setSelectedPackageId(null);
    setEventSearch("");
    setPackageSearch("");
    setFormTitle("");
    setFormBadge("");
    setFormSubtitle("");
    setFormDestination("");
    setFormImageUrl("");
    setFormMobileImageUrl("");
    setFormVideoUrl("");
    setFormImagePublicId("");
    setFormStartDateTime("");
    setFormEndDateTime("");
    setFormStartingPrice("");
    setFormRealPrice("");
    setFormCurrency("INR");
    setFormCustomCurrency("");
    setFormDiscountLabel("");
    setFormOfferPoints([""]);
    setFormCtaText("");
    setFormCtaLink("");
    setFormOpenInNewTab(false);
    setFormShowCountdown(true);
    setFormShowPrice(true);
    setFormShowPoints(true);
    setFormShowCTA(true);
    setFormTextAlignment("left");
    setFormOverlayStrength("medium");
    setFormIsActive(true);
    setFormError(null);
  };

  const handleOpenCreateModal = () => {
    resetFormState();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlideRecord) => {
    setEditingSlide(slide);
    const slideMode = slide.type || (slide.eventId ? "EVENT" : "CUSTOM");
    setMode(slideMode);
    setSelectedEventId(slide.eventId || null);
    setSelectedPackageId(slide.packageId || null);

    setFormTitle(slide.title || "");
    setFormBadge(slide.badgeTag || "");
    setFormSubtitle(slide.subtitle || "");
    setFormDestination((slide as any).destination?.name || (typeof (slide as any).destination === "string" ? (slide as any).destination : "") || "");
    setFormImageUrl(slide.imageUrl || slide.desktopImage || "");
    setFormMobileImageUrl(slide.mobileImage || "");
    setFormVideoUrl(slide.videoUrl || "");
    setFormImagePublicId(slide.imagePublicId || "");

    const toDateTimeLocal = (val: any) => {
      if (!val) return "";
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return "";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {
        return "";
      }
    };

    setFormStartDateTime(toDateTimeLocal(slide.startDate));
    setFormEndDateTime(toDateTimeLocal(slide.endDate));

    setFormStartingPrice(slide.startingPrice !== null && slide.startingPrice !== undefined ? slide.startingPrice : "");
    setFormRealPrice(slide.realPrice !== null && slide.realPrice !== undefined ? slide.realPrice : "");

    const knownCurrencies = ["INR", "AED", "SAR", "USD"];
    if (slide.currency && !knownCurrencies.includes(slide.currency)) {
      setFormCurrency("Custom");
      setFormCustomCurrency(slide.currency);
    } else {
      setFormCurrency(slide.currency || "INR");
      setFormCustomCurrency("");
    }

    setFormDiscountLabel(slide.discountLabel || "");
    setFormOfferPoints(Array.isArray(slide.offerPoints) && slide.offerPoints.length > 0 ? slide.offerPoints : [""]);
    setFormCtaText(slide.ctaText || "");
    setFormCtaLink(slide.ctaLink || "");
    setFormOpenInNewTab(Boolean(slide.openInNewTab));
    setFormShowCountdown(slide.showCountdown !== undefined ? Boolean(slide.showCountdown) : true);
    setFormShowPrice(slide.showPrice !== undefined ? Boolean(slide.showPrice) : true);
    setFormShowPoints(slide.showPoints !== undefined ? Boolean(slide.showPoints) : true);
    setFormShowCTA(slide.showCTA !== undefined ? Boolean(slide.showCTA) : true);
    setFormTextAlignment(slide.textAlignment || "left");
    setFormOverlayStrength(slide.overlayStrength || "medium");
    setFormIsActive(slide.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDuplicateAsNewOffer = (slide: HeroSlideRecord) => {
    setEditingSlide(null);
    setMode("SCHEDULED_OFFER");
    setSelectedEventId(null);
    setSelectedPackageId(slide.packageId || null);

    setFormTitle(`${slide.title || "Offer"} (Copy)`);
    setFormBadge(slide.badgeTag || "LIMITED OFFER");
    setFormSubtitle(slide.subtitle || "");
    setFormDestination((slide as any).destination?.name || (typeof (slide as any).destination === "string" ? (slide as any).destination : "") || "");
    setFormImageUrl(slide.imageUrl || slide.desktopImage || "");
    setFormMobileImageUrl(slide.mobileImage || "");
    setFormVideoUrl(slide.videoUrl || "");
    setFormImagePublicId("");
    setFormStartDateTime("");
    setFormEndDateTime("");

    setFormStartingPrice(slide.startingPrice !== null && slide.startingPrice !== undefined ? slide.startingPrice : "");
    setFormRealPrice(slide.realPrice !== null && slide.realPrice !== undefined ? slide.realPrice : "");

    const knownCurrencies = ["INR", "AED", "SAR", "USD"];
    if (slide.currency && !knownCurrencies.includes(slide.currency)) {
      setFormCurrency("Custom");
      setFormCustomCurrency(slide.currency);
    } else {
      setFormCurrency(slide.currency || "INR");
      setFormCustomCurrency("");
    }

    setFormDiscountLabel(slide.discountLabel || "");
    setFormOfferPoints(Array.isArray(slide.offerPoints) && slide.offerPoints.length > 0 ? slide.offerPoints : [""]);
    setFormCtaText(slide.ctaText || "Book Now");
    setFormCtaLink(slide.ctaLink || "");
    setFormOpenInNewTab(Boolean(slide.openInNewTab));
    setFormShowCountdown(true);
    setFormShowPrice(true);
    setFormShowPoints(true);
    setFormShowCTA(true);
    setFormTextAlignment(slide.textAlignment || "left");
    setFormOverlayStrength(slide.overlayStrength || "medium");
    setFormIsActive(true);
    setFormError("Set new Start & End date-times for this duplicated offer.");
    setIsModalOpen(true);
  };

  const handleAddPoint = () => {
    setFormOfferPoints((prev) => [...prev, ""]);
  };

  const handleRemovePoint = (index: number) => {
    setFormOfferPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, value: string) => {
    setFormOfferPoints((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSelectPackageAndAutoFill = (pkg: PackageOption) => {
    setSelectedPackageId(pkg.id);
    if (!formTitle) setFormTitle(pkg.title || "");
    if (!formDestination && (pkg.destination?.name || pkg.destinationName)) {
      setFormDestination(pkg.destination?.name || pkg.destinationName || "");
    }
    if (!formImageUrl && pkg.coverImage) {
      setFormImageUrl(pkg.coverImage);
    }
    if (formStartingPrice === "" && pkg.price) {
      setFormStartingPrice(pkg.price);
    }
    if (formRealPrice === "" && (pkg.realPrice || pkg.originalPrice)) {
      setFormRealPrice(pkg.realPrice || pkg.originalPrice || "");
    }
    if (!formCtaLink && pkg.slug) {
      setFormCtaLink(`/packages/${pkg.slug}`);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === "EVENT") {
      if (!selectedEventId) {
        setFormError("Please select an Upcoming Trip event.");
        return;
      }
    } else if (mode === "SCHEDULED_OFFER") {
      if (!formTitle.trim()) {
        setFormError("Offer Title is required.");
        return;
      }
      if (!formStartDateTime || !formEndDateTime) {
        setFormError("Both Start Date & Time and End Date & Time are required for scheduled offer.");
        return;
      }
      const startMs = new Date(formStartDateTime).getTime();
      const endMs = new Date(formEndDateTime).getTime();
      if (isNaN(startMs) || isNaN(endMs)) {
        setFormError("Invalid Start or End Date-Time format.");
        return;
      }
      if (endMs <= startMs) {
        setFormError("End Date & Time must be strictly after Start Date & Time.");
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

    const finalCurrency = formCurrency === "Custom" ? formCustomCurrency.trim() || "INR" : formCurrency;
    const cleanPoints = formOfferPoints.map((p) => p.trim()).filter(Boolean);

    const payload = {
      type: mode,
      eventId: mode === "EVENT" ? selectedEventId : null,
      packageId: mode === "SCHEDULED_OFFER" ? selectedPackageId : null,
      title: formTitle.trim() || undefined,
      badgeTag: formBadge.trim() || undefined,
      subtitle: formSubtitle.trim() || undefined,
      destination: formDestination.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      mobileImage: formMobileImageUrl.trim() || undefined,
      videoUrl: formVideoUrl.trim() || undefined,
      imagePublicId: formImagePublicId.trim() || undefined,
      startDate: formStartDateTime ? new Date(formStartDateTime).toISOString() : undefined,
      endDate: formEndDateTime ? new Date(formEndDateTime).toISOString() : undefined,
      startingPrice: formStartingPrice !== "" ? Number(formStartingPrice) : undefined,
      realPrice: formRealPrice !== "" ? Number(formRealPrice) : undefined,
      currency: finalCurrency,
      discountLabel: formDiscountLabel.trim() || undefined,
      offerPoints: cleanPoints,
      ctaText: formCtaText.trim() || undefined,
      ctaLink: formCtaLink.trim() || undefined,
      openInNewTab: formOpenInNewTab,
      showCountdown: formShowCountdown,
      showPrice: formShowPrice,
      showPoints: formShowPoints,
      showCTA: formShowCTA,
      textAlignment: formTextAlignment,
      overlayStrength: formOverlayStrength,
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

    const updated = newSlides.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSlides(updated);

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

  const filteredEvents = upcomingEvents.filter((ev) => {
    const q = eventSearch.toLowerCase();
    return (
      ev.packageTitle.toLowerCase().includes(q) ||
      ev.batchName.toLowerCase().includes(q) ||
      ev.destination.toLowerCase().includes(q)
    );
  });

  const filteredPackages = packages.filter((pkg) => {
    const q = packageSearch.toLowerCase();
    return (
      pkg.title.toLowerCase().includes(q) ||
      (pkg.destination?.name && pkg.destination.name.toLowerCase().includes(q))
    );
  });

  const selectedEvent = upcomingEvents.find((ev) => ev.id === selectedEventId);
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const addedEventIds = new Set(slides.filter((s) => s.type === "EVENT" && s.eventId).map((s) => s.eventId));

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-4 py-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#3478F6] font-bold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Homepage Content & Promotions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B1026]">Hero Slides Manager</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Rotate live homepage banners via Event Departures, Custom Banners, or Scheduled Offers & Flash Sales.
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
              Add your first Hero Slide from an Upcoming Event, Custom Banner, or Scheduled Promotion Offer.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, idx) => {
            const slideType = slide.type || (slide.eventId ? "EVENT" : "CUSTOM");
            const linkedEv = slide.event || upcomingEvents.find((e) => e.id === slide.eventId);
            const linkedPkg = slide.package || packages.find((p) => p.id === slide.packageId);

            const title = slide.title || linkedEv?.packageTitle || linkedPkg?.title || "Hero Slide";
            const badge = slide.badgeTag || (slideType === "EVENT" ? "UPCOMING TRIP" : slideType === "SCHEDULED_OFFER" ? "LIMITED OFFER" : "PROMOTION");
            const subtitle = slide.subtitle || (linkedEv ? `${formatDate(linkedEv.startDate)} – ${formatDate(linkedEv.endDate)} • ${linkedEv.duration}` : "");
            const img = getHeroImage(slide) || getHeroImage(linkedEv) || linkedPkg?.coverImage || "";
            const offerPrice = slide.startingPrice ?? (linkedEv?.offerPrice || linkedPkg?.price);
            const realPrice = slide.realPrice ?? (linkedEv?.realPrice || linkedPkg?.realPrice || linkedPkg?.originalPrice);

            const status = getSlideStatus(slide);
            const remainingTime = slideType === "SCHEDULED_OFFER" ? getRemainingTimeString(slide.endDate) : null;

            return (
              <div
                key={slide.id}
                className={`bg-white border rounded-3xl p-4 sm:p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  slide.isActive ? "border-[#E8ECF3]" : "border-gray-200 opacity-60 bg-gray-50/50"
                }`}
              >
                {/* Thumbnail Image & Type Badge */}
                <div className="relative w-full md:w-52 aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shrink-0 border border-[#E8ECF3]">
                  {img ? (
                    <Image src={img} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 220px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">No Image</div>
                  )}

                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs ${
                        slideType === "EVENT"
                          ? "bg-[#3478F6]"
                          : slideType === "SCHEDULED_OFFER"
                          ? "bg-amber-500"
                          : "bg-purple-600"
                      }`}
                    >
                      {slideType === "EVENT" ? "EVENT" : slideType === "SCHEDULED_OFFER" ? "OFFER" : "CUSTOM"}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    #{idx + 1}
                  </div>
                </div>

                {/* Info & Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#3478F6]/10 text-[#3478F6] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      {badge}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                        status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : status === "SCHEDULED"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : status === "EXPIRED"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {status}
                    </span>

                    {remainingTime && status === "ACTIVE" && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Ends in {remainingTime}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B1026] truncate">{title}</h3>

                  {subtitle && <p className="text-xs text-gray-500 font-medium line-clamp-1">{subtitle}</p>}

                  {/* Schedule Timestamps for Scheduled Offers */}
                  {slideType === "SCHEDULED_OFFER" && (slide.startDate || slide.endDate) && (
                    <div className="text-[11px] text-gray-500 font-medium grid grid-cols-1 sm:grid-cols-2 gap-1 bg-[#F8FAFC] p-2 rounded-xl border border-gray-100">
                      {slide.startDate && (
                        <div>
                          <strong className="text-gray-700">Starts:</strong> {formatDate(slide.startDate)}
                        </div>
                      )}
                      {slide.endDate && (
                        <div>
                          <strong className="text-gray-700">Ends:</strong> {formatDate(slide.endDate)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3 pt-0.5 text-xs">
                    {offerPrice ? (
                      <span className="font-extrabold text-[#3478F6] text-sm">
                        {slide.currency && slide.currency !== "INR" ? `${slide.currency} ` : "₹"}
                        {offerPrice.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">No price tag</span>
                    )}

                    {realPrice ? (
                      <span className="text-gray-400 line-through font-semibold">
                        {slide.currency && slide.currency !== "INR" ? `${slide.currency} ` : "₹"}
                        {realPrice.toLocaleString("en-IN")}
                      </span>
                    ) : null}

                    {slide.discountLabel && (
                      <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-200">
                        {slide.discountLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions & Reordering */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E8ECF3]">
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

                  <div className="flex items-center gap-1.5 justify-end flex-wrap">
                    {status === "EXPIRED" && slideType === "SCHEDULED_OFFER" && (
                      <button
                        onClick={() => handleDuplicateAsNewOffer(slide)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                        title="Duplicate as New Offer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>
                    )}

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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 border border-[#E8ECF3] my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0B1026]">
                  {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                </h2>
                <p className="text-xs text-gray-500">Choose slide mode: Event Departure, Custom Banner, or Scheduled Offer.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!editingSlide && (
              <div className="bg-[#F3F7FF] p-1.5 rounded-2xl border border-[#E8ECF3] grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode("EVENT")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === "EVENT" ? "bg-[#3478F6] text-white shadow-sm" : "text-gray-600 hover:text-[#0B1026]"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="truncate">Event Slide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("CUSTOM")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === "CUSTOM" ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 hover:text-[#0B1026]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">Custom Slide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("SCHEDULED_OFFER")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === "SCHEDULED_OFFER" ? "bg-amber-500 text-white shadow-sm" : "text-gray-600 hover:text-[#0B1026]"
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span className="truncate">Scheduled Offer</span>
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlide} className="space-y-5">
              {/* MODE 1: EVENT SELECTOR */}
              {mode === "EVENT" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">Select Upcoming Event Departure</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search trip, destination, or batch..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {filteredEvents.map((ev) => {
                      const isSelected = selectedEventId === ev.id;
                      const isAlreadyAdded = addedEventIds.has(ev.id) && editingSlide?.eventId !== ev.id;

                      return (
                        <div
                          key={ev.id}
                          onClick={() => !isAlreadyAdded && setSelectedEventId(ev.id)}
                          className={`p-3 rounded-2xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "border-[#3478F6] bg-[#F3F7FF]"
                              : isAlreadyAdded
                              ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div>
                            <div className="font-extrabold text-[#0B1026]">{ev.packageTitle}</div>
                            <div className="text-gray-500 text-[11px] mt-0.5">
                              Batch: {ev.batchName} ({formatDate(ev.startDate)}) • {ev.duration}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3478F6]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODE 3: PACKAGE CONNECTION */}
              {mode === "SCHEDULED_OFFER" && packages.length > 0 && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>Optional Package Connection</span>
                    </label>
                    {selectedPackageId && (
                      <button
                        type="button"
                        onClick={() => setSelectedPackageId(null)}
                        className="text-[11px] text-amber-700 hover:underline font-bold"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Search and select a package to auto-fill title, destination, price & links (you can still override all fields).
                  </p>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-amber-600" />
                    <input
                      type="text"
                      placeholder="Search tour packages by name..."
                      value={packageSearch}
                      onChange={(e) => setPackageSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  {packageSearch && (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 bg-white p-2 rounded-xl border border-amber-200">
                      {filteredPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            handleSelectPackageAndAutoFill(pkg);
                            setPackageSearch("");
                          }}
                          className={`p-2 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            selectedPackageId === pkg.id ? "bg-amber-100 text-amber-900 font-extrabold" : "hover:bg-amber-50"
                          }`}
                        >
                          <div>
                            <span className="font-bold">{pkg.title}</span>
                            {pkg.price && <span className="ml-2 text-gray-500 font-normal">₹{pkg.price.toLocaleString("en-IN")}</span>}
                          </div>
                          {selectedPackageId === pkg.id && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BASIC CONTENT */}
              {(mode === "CUSTOM" || mode === "SCHEDULED_OFFER") && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 border-b pb-1">
                    Basic Content
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Offer / Slide Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Meghalaya Special Flash Sale"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text (Optional Tag)</label>
                      <input
                        type="text"
                        placeholder="LIMITED OFFER, 2 DAYS ONLY, EARLY BIRD, FLASH SALE"
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle / Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Explore the clouds & waterfalls for less with Malayali tour captains"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Destination Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Meghalaya, Kashmir, Wayanad"
                      value={formDestination}
                      onChange={(e) => setFormDestination(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC OFFER HIGHLIGHTS / BULLET POINTS */}
              {mode === "SCHEDULED_OFFER" && (
                <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-[#0B1026] flex items-center gap-1.5">
                      <ListPlus className="w-4 h-4 text-[#3478F6]" />
                      <span>Offer Highlights (Bullet Points)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="text-xs font-bold text-[#3478F6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Add Point</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formOfferPoints.map((point, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3478F6] shrink-0">✓</span>
                        <input
                          type="text"
                          placeholder={`Highlight e.g. "4 Nights / 5 Days" or "Breakfast Included"`}
                          value={point}
                          onChange={(e) => handlePointChange(i, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                        />
                        {formOfferPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePoint(i)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-xl cursor-pointer"
                            title="Remove Point"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRICING & DISCOUNT */}
              {(mode === "CUSTOM" || mode === "SCHEDULED_OFFER") && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 border-b pb-1">
                    Pricing & Discounts
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (Strikethrough)</label>
                      <input
                        type="number"
                        placeholder="e.g. 14999"
                        value={formRealPrice}
                        onChange={(e) => setFormRealPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Offer / Promoted Price</label>
                      <input
                        type="number"
                        placeholder="e.g. 9999"
                        value={formStartingPrice}
                        onChange={(e) => setFormStartingPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
                      <select
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="AED">AED (AED)</option>
                        <option value="SAR">SAR (SAR)</option>
                        <option value="USD">USD ($)</option>
                        <option value="Custom">Custom Symbol</option>
                      </select>
                      {formCurrency === "Custom" && (
                        <input
                          type="text"
                          placeholder="e.g. EUR"
                          value={formCustomCurrency}
                          onChange={(e) => setFormCustomCurrency(e.target.value)}
                          className="w-full mt-1.5 px-3 py-1.5 bg-white border border-[#E8ECF3] rounded-lg text-xs"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Discount Label</label>
                      <input
                        type="text"
                        placeholder="e.g. SAVE ₹5,000"
                        value={formDiscountLabel}
                        onChange={(e) => setFormDiscountLabel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OFFER SCHEDULING */}
              {mode === "SCHEDULED_OFFER" && (
                <div className="space-y-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 border-b border-amber-200 pb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Offer Schedule (Automatic Active / Expired Filter)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Start Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formStartDateTime}
                        onChange={(e) => setFormStartDateTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        End Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formEndDateTime}
                        onChange={(e) => setFormEndDateTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CTA BUTTON */}
              {(mode === "CUSTOM" || mode === "SCHEDULED_OFFER") && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 border-b pb-1">
                    Call To Action (CTA) Button
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Book Now, View Package, WhatsApp Now"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Button Action URL / Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. /packages/meghalaya or https://..."
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3478F6] outline-hidden"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formOpenInNewTab}
                      onChange={(e) => setFormOpenInNewTab(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-gray-300 text-[#3478F6] focus:ring-[#3478F6]"
                    />
                    <span className="text-xs font-semibold text-gray-700">Open link in a new tab</span>
                  </label>
                </div>
              )}

              {/* BACKGROUND / MEDIA */}
              {(mode === "CUSTOM" || mode === "SCHEDULED_OFFER") && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 border-b pb-1">
                    Background / Media Assets
                  </h3>

                  <CustomHeroUploader
                    value={formImageUrl}
                    onChange={(url, publicId) => {
                      setFormImageUrl(url);
                      if (publicId) setFormImagePublicId(publicId);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Background Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formMobileImageUrl}
                        onChange={(e) => setFormMobileImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Background Video URL (Optional .webm/.mp4)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE DISPLAY OPTIONS & TOGGLES */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 border-b pb-1">
                  Display & Layout Options
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Text Alignment</label>
                    <select
                      value={formTextAlignment}
                      onChange={(e) => setFormTextAlignment(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium"
                    >
                      <option value="left">Left Aligned</option>
                      <option value="center">Center Aligned</option>
                      <option value="right">Right Aligned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Overlay Strength</label>
                    <select
                      value={formOverlayStrength}
                      onChange={(e) => setFormOverlayStrength(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-[#E8ECF3] rounded-xl text-xs font-medium"
                    >
                      <option value="light">Light (30%)</option>
                      <option value="medium">Medium (50%)</option>
                      <option value="dark">Dark (70%)</option>
                      <option value="heavy">Heavy (85%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {mode === "SCHEDULED_OFFER" && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formShowCountdown}
                        onChange={(e) => setFormShowCountdown(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Show Countdown</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formShowPrice}
                      onChange={(e) => setFormShowPrice(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-gray-300 text-[#3478F6] focus:ring-[#3478F6]"
                    />
                    <span>Show Price Tag</span>
                  </label>

                  {mode === "SCHEDULED_OFFER" && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formShowPoints}
                        onChange={(e) => setFormShowPoints(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-gray-300 text-[#3478F6] focus:ring-[#3478F6]"
                      />
                      <span>Show Highlights</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formShowCTA}
                      onChange={(e) => setFormShowCTA(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-gray-300 text-[#3478F6] focus:ring-[#3478F6]"
                    />
                    <span>Show CTA Button</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8ECF3] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span className="text-xs font-extrabold text-gray-800">Enabled (Manual Active Toggle)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#3478F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingSlide ? "Update Slide" : "Save Hero Slide"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-[#0B1026]">Delete Hero Slide?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <strong className="text-gray-800">&quot;{deleteTarget.title || "this slide"}&quot;</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-[#0B1026] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#3478F6]" />
                <span>Live Hero Slide Preview ({previewSlide.type || "CUSTOM"})</span>
              </h3>
              <button onClick={() => setPreviewSlide(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden min-h-[360px] bg-slate-900 flex items-center justify-center p-6 text-white text-center">
              {previewSlide.imageUrl && (
                <Image src={previewSlide.imageUrl} alt="Preview" fill className="object-cover opacity-50" />
              )}
              <div className="relative z-10 max-w-lg space-y-3">
                {previewSlide.badgeTag && (
                  <span className="bg-[#3478F6] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full inline-block">
                    {previewSlide.badgeTag}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold">{previewSlide.title}</h2>
                {previewSlide.subtitle && <p className="text-xs sm:text-sm text-gray-200">{previewSlide.subtitle}</p>}
                {previewSlide.startingPrice && (
                  <div className="text-xl font-extrabold text-amber-400">
                    {previewSlide.currency && previewSlide.currency !== "INR" ? `${previewSlide.currency} ` : "₹"}
                    {previewSlide.startingPrice.toLocaleString("en-IN")}
                  </div>
                )}
                {previewSlide.ctaText && (
                  <button className="bg-[#3478F6] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg mt-2 inline-block">
                    {previewSlide.ctaText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

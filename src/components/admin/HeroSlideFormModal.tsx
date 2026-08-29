"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { X, Save, AlertCircle, RefreshCw } from "lucide-react";
import { HeroSlideUploader } from "./HeroSlideUploader";

export interface HeroSlideFormData {
  id?: string;
  title: string;
  badgeTag?: string;
  subtitle?: string;
  imageUrl: string;
  imagePublicId: string;
  startingPrice?: number | null;
  realPrice?: number | null;
  isActive: boolean;
  sortOrder: number;
}

interface FormErrors {
  title?: string;
  image?: string;
  startingPrice?: string;
  realPrice?: string;
}

interface HeroSlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: HeroSlideFormData | null;
}

export function HeroSlideFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: HeroSlideFormModalProps) {
  const [formData, setFormData] = useState<HeroSlideFormData>({
    title: "",
    badgeTag: "",
    subtitle: "",
    imageUrl: "",
    imagePublicId: "",
    startingPrice: null,
    realPrice: null,
    isActive: true,
    sortOrder: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Field element references for auto-focusing the first invalid field on submit
  const titleInputRef = useRef<HTMLInputElement>(null);
  const startingPriceInputRef = useRef<HTMLInputElement>(null);
  const realPriceInputRef = useRef<HTMLInputElement>(null);

  // Lock background page scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        badgeTag: initialData.badgeTag || "",
        subtitle: initialData.subtitle || "",
        imageUrl: initialData.imageUrl || "",
        imagePublicId: initialData.imagePublicId || "",
        startingPrice: initialData.startingPrice ?? null,
        realPrice: initialData.realPrice ?? null,
        isActive: initialData.isActive ?? true,
        sortOrder: initialData.sortOrder ?? 0,
      });
    } else {
      setFormData({
        title: "",
        badgeTag: "",
        subtitle: "",
        imageUrl: "",
        imagePublicId: "",
        startingPrice: null,
        realPrice: null,
        isActive: true,
        sortOrder: 0,
      });
    }
    setFieldErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Slide title is required.";
    }

    if (!formData.imageUrl || !formData.imagePublicId) {
      errors.image = "Hero image is required.";
    }

    if (
      formData.startingPrice !== null &&
      formData.startingPrice !== undefined &&
      formData.startingPrice < 0
    ) {
      errors.startingPrice = "Starting price cannot be negative.";
    }

    if (
      formData.realPrice !== null &&
      formData.realPrice !== undefined &&
      formData.realPrice < 0
    ) {
      errors.realPrice = "Real price cannot be negative.";
    }

    if (
      !errors.startingPrice &&
      !errors.realPrice &&
      formData.startingPrice !== null &&
      formData.startingPrice !== undefined &&
      formData.realPrice !== null &&
      formData.realPrice !== undefined &&
      formData.realPrice < formData.startingPrice
    ) {
      errors.realPrice = "Real price must be greater than or equal to the offer price.";
    }

    setFieldErrors(errors);

    // Auto-focus the first invalid field
    if (errors.title && titleInputRef.current) {
      titleInputRef.current.focus();
    } else if (errors.startingPrice && startingPriceInputRef.current) {
      startingPriceInputRef.current.focus();
    } else if (errors.realPrice && realPriceInputRef.current) {
      realPriceInputRef.current.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = initialData?.id
        ? `/api/admin/hero-slides/${initialData.id}`
        : `/api/admin/hero-slides`;
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save hero slide.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (fieldName: keyof FormErrors) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-[calc(100%-16px)] min-[360px]:w-[calc(100%-20px)] max-w-[420px] sm:max-w-2xl max-h-[calc(100dvh-20px)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-[16px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto border-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shrink-0">
          <div>
            <h2 className="text-[18px] sm:text-lg font-bold text-[#0B1026] dark:text-white leading-tight">
              {initialData?.id ? "Edit Hero Slide" : "Add New Hero Slide"}
            </h2>
            <p className="text-[12px] text-[#667085] dark:text-gray-400 leading-[1.4] mt-0.5">
              Configure homepage hero banner title, Cloudinary media & pricing.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 -mr-1 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
          <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto max-h-[calc(100dvh-130px)] min-w-0 flex-1 overscroll-contain">
            {serverError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Slide Title */}
            <div className="space-y-1">
              <label htmlFor="title" className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
                Slide Title *
              </label>
              <input
                ref={titleInputRef}
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  clearFieldError("title");
                }}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "title-error" : undefined}
                placeholder="Explore Meghalaya"
                className={`w-full h-12 px-3.5 rounded-[11px] text-base sm:text-xs font-bold transition-colors outline-none min-h-[48px] ${
                  fieldErrors.title
                    ? "bg-red-50/50 dark:bg-red-950/20 border border-red-500 text-red-900 dark:text-red-200 focus:ring-2 focus:ring-red-500/20"
                    : "bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3478F6]"
                }`}
              />
              {fieldErrors.title && (
                <p id="title-error" role="alert" className="text-xs text-red-500 dark:text-red-400 font-medium mt-1 flex items-center gap-1 break-words">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.title}</span>
                </p>
              )}
            </div>

            {/* Badge Tag */}
            <div className="space-y-1">
              <label htmlFor="badgeTag" className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
                Badge Tag
              </label>
              <input
                id="badgeTag"
                type="text"
                value={formData.badgeTag || ""}
                onChange={(e) => setFormData({ ...formData, badgeTag: e.target.value })}
                placeholder="Most Popular Group Trip"
                className="w-full h-12 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-[11px] text-base sm:text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3478F6] outline-none min-h-[48px]"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label htmlFor="subtitle" className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
                Subtitle
              </label>
              <textarea
                id="subtitle"
                rows={3}
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Kerala to Northeast Special Departure with Malayali tour lead"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-[11px] text-base sm:text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3478F6] outline-none resize-none min-h-[80px]"
              />
            </div>

            {/* Cloudinary Image Uploader */}
            <HeroSlideUploader
              value={
                formData.imageUrl
                  ? { url: formData.imageUrl, publicId: formData.imagePublicId }
                  : null
              }
              onChange={(val) => {
                setFormData({
                  ...formData,
                  imageUrl: val?.url || "",
                  imagePublicId: val?.publicId || "",
                });
                clearFieldError("image");
              }}
              onUploadingChange={setUploadingImage}
              fieldError={fieldErrors.image}
            />

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="startingPrice" className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
                  Starting Price (₹) <span className="text-[#3478F6] font-normal">— Offer Price</span>
                </label>
                <input
                  ref={startingPriceInputRef}
                  id="startingPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.startingPrice ?? ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      startingPrice: e.target.value !== "" ? Number(e.target.value) : null,
                    });
                    clearFieldError("startingPrice");
                    clearFieldError("realPrice");
                  }}
                  aria-invalid={Boolean(fieldErrors.startingPrice)}
                  aria-describedby={fieldErrors.startingPrice ? "startingPrice-error" : undefined}
                  placeholder="5699"
                  className={`w-full h-12 px-3.5 rounded-[11px] text-base sm:text-xs font-semibold transition-colors outline-none min-h-[48px] ${
                    fieldErrors.startingPrice
                      ? "bg-red-50/50 dark:bg-red-950/20 border border-red-500 text-red-900 dark:text-red-200 focus:ring-2 focus:ring-red-500/20"
                      : "bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3478F6]"
                  }`}
                />
                {fieldErrors.startingPrice && (
                  <p id="startingPrice-error" role="alert" className="text-xs text-red-500 dark:text-red-400 font-medium mt-1 flex items-center gap-1 break-words">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.startingPrice}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="realPrice" className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
                  Real Price (₹) <span className="text-gray-400 font-normal">— MRP</span>
                </label>
                <input
                  ref={realPriceInputRef}
                  id="realPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.realPrice ?? ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      realPrice: e.target.value !== "" ? Number(e.target.value) : null,
                    });
                    clearFieldError("realPrice");
                  }}
                  aria-invalid={Boolean(fieldErrors.realPrice)}
                  aria-describedby={fieldErrors.realPrice ? "realPrice-error" : undefined}
                  placeholder="7999"
                  className={`w-full h-12 px-3.5 rounded-[11px] text-base sm:text-xs font-semibold transition-colors outline-none min-h-[48px] ${
                    fieldErrors.realPrice
                      ? "bg-red-50/50 dark:bg-red-950/20 border border-red-500 text-red-900 dark:text-red-200 focus:ring-2 focus:ring-red-500/20"
                      : "bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3478F6]"
                  }`}
                />
                {fieldErrors.realPrice && (
                  <p id="realPrice-error" role="alert" className="text-xs text-red-500 dark:text-red-400 font-medium mt-1 flex items-center gap-1 break-words">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.realPrice}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label htmlFor="sortOrder" className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
                Sort Order
              </label>
              <input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full h-12 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-[11px] text-base sm:text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#3478F6] outline-none min-h-[48px]"
              />
            </div>

            {/* Compact Single-Row Active Toggle */}
            <div className="h-12 flex items-center py-1">
              <label className="relative inline-flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    formData.isActive ? "bg-[#3478F6]" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      formData.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-[13px] font-semibold text-[#0B1026] dark:text-gray-100">
                  {formData.isActive ? "Active on Homepage" : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="sticky bottom-0 z-20 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 sm:px-6 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shrink-0">
            <div className="grid grid-cols-2 gap-2.5 h-[46px] min-h-[46px]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || uploadingImage}
                className="w-full h-full px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="w-full h-full bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{initialData?.id ? "Update Slide" : "Save Slide"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

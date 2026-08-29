"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, RefreshCw, AlertCircle } from "lucide-react";

interface HeroSlideUploaderProps {
  value?: { url: string; publicId: string } | null;
  onChange: (value: { url: string; publicId: string } | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  fieldError?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function HeroSlideUploader({
  value,
  onChange,
  onUploadingChange,
  fieldError,
}: HeroSlideUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported image format. Please upload JPEG, PNG, WebP, or AVIF.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/hero-slides/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onChange({
        url: data.url,
        publicId: data.publicId,
      });
    } catch (err: any) {
      setError(err?.message || "Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const activeError = fieldError || error;

  return (
    <div className="w-full space-y-1.5 min-w-0">
      <label className="block text-[13px] font-semibold text-[#0B1026] dark:text-gray-100 mb-1">
        Banner Image * <span className="text-gray-400 font-normal">(Cloudinary Upload)</span>
      </label>

      {value?.url ? (
        <div className={`relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden bg-gray-900 group shadow-sm border ${
          activeError ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-200 dark:border-gray-800"
        }`}>
          <Image
            src={value.url}
            alt="Hero Banner Preview"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white/90 hover:bg-white text-gray-900 px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="bg-red-600/90 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-sm truncate max-w-[180px]">
            {value.publicId}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[170px] w-full min-w-0 ${
            activeError
              ? "border-red-500 bg-red-50/30 dark:bg-red-950/20"
              : isDragging
              ? "border-[#3478F6] bg-[#3478F6]/10 dark:bg-[#3478F6]/20"
              : "border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-900/50 hover:bg-gray-100/60 dark:hover:bg-slate-800/60"
          } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <RefreshCw className="w-7 h-7 text-[#3478F6] animate-spin" />
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                Uploading to Cloudinary...
              </p>
              <p className="text-[11px] text-gray-500">Please wait while we process your image.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3478F6]/10 dark:bg-[#3478F6]/20 text-[#3478F6] flex items-center justify-center mb-1">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                <span className="text-[#3478F6]">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                JPG, PNG, WebP or AVIF (Max {MAX_SIZE_MB}MB)
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {activeError && (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400 font-medium mt-1 flex items-center gap-1 break-words">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
}

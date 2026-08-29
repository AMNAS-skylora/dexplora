"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, RefreshCw, AlertCircle } from "lucide-react";

interface PackageCoverUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  error?: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function PackageCoverUploader({
  value,
  onChange,
  onUploadingChange,
  error: propError,
}: PackageCoverUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setLocalError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Please upload JPG, PNG, WEBP, or AVIF.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/packages/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload cover image.");
      }

      onChange(data.url);
    } catch (err: any) {
      setLocalError(err?.message || "Cover image upload failed. Please try again.");
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
    onChange("");
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = propError || localError;

  return (
    <div className="w-full space-y-1.5 min-w-0">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#0B1026]">
          Cover Image * <span className="text-gray-400 font-normal">(Cloudinary Upload)</span>
        </label>
        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
          Recommended: 1600 × 900 or larger (16:9)
        </span>
      </div>

      {value ? (
        <div className={`relative w-full aspect-[16/9] max-h-72 rounded-2xl overflow-hidden bg-gray-900 group shadow-sm border ${
          displayError ? "border-red-500 ring-2 ring-red-500/20" : "border-[#E8ECF3]"
        }`}>
          <Image
            src={value}
            alt="Package Cover Preview"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="bg-red-600/90 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all min-h-[40px] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] w-full min-w-0 ${
            displayError
              ? "border-red-500 bg-red-50/40"
              : isDragging
              ? "border-[#3478F6] bg-[#3478F6]/10"
              : "border-gray-300 bg-[#F8FAFC] hover:bg-gray-100/70"
          } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <RefreshCw className="w-7 h-7 text-[#3478F6] animate-spin" />
              <p className="text-xs font-bold text-gray-900">
                Uploading cover image to Cloudinary...
              </p>
              <p className="text-[11px] text-gray-500">Please wait while we process your upload.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-11 h-11 rounded-full bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-900">
                <span className="text-[#3478F6]">Click to upload cover image</span> or drag and drop
              </p>
              <p className="text-[11px] text-gray-500">
                JPG, PNG, WEBP, or AVIF (Max {MAX_SIZE_MB} MB)
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

      {displayError && (
        <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1 break-words">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
}

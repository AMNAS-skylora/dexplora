"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, RefreshCw, AlertCircle } from "lucide-react";

interface CustomHeroUploaderProps {
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  error?: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function CustomHeroUploader({
  value,
  onChange,
  error: externalError,
}: CustomHeroUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const error = externalError || internalError;

  const handleUploadFile = async (file: File) => {
    setInternalError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setInternalError("Please upload a valid image (JPG, PNG, WEBP, or AVIF).");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setInternalError(`Hero image file size must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/hero-slides/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload hero image.");
      }

      onChange(data.url, data.publicId);
    } catch (err: any) {
      setInternalError(err?.message || "Hero image upload failed.");
    } finally {
      setIsUploading(false);
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
    onChange("", "");
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-bold text-[#0B1026]">
        Hero Banner Image *
      </label>

      {value ? (
        <div className="relative w-full aspect-[16/8] rounded-2xl overflow-hidden bg-gray-900 border border-[#E8ECF3] group shadow-xs">
          <Image
            src={value}
            alt="Hero Preview"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white/90 hover:bg-white text-gray-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all min-h-[38px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="bg-red-600/90 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all min-h-[38px] cursor-pointer"
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
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] w-full ${
            isDragging
              ? "border-[#3478F6] bg-[#3478F6]/10"
              : error
              ? "border-red-400 bg-red-50/50"
              : "border-gray-200 bg-[#F8FAFC] hover:bg-gray-50 hover:border-[#3478F6]"
          } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-xs font-bold text-[#3478F6]">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Uploading hero banner to Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 font-medium">
                <span className="text-[#3478F6] font-bold">Click to upload banner</span> or drag and drop
              </p>
              <p className="text-[10px] text-gray-400">Recommended size: 1920×1080 (JPG, PNG, WEBP, AVIF)</p>
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

      {error && (
        <p role="alert" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

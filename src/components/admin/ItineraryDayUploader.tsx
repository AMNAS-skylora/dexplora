"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, RefreshCw, AlertCircle } from "lucide-react";

interface ItineraryDayUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  dayNumber: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ItineraryDayUploader({
  value,
  onChange,
  dayNumber,
}: ItineraryDayUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload JPG, PNG, WEBP, or AVIF.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/packages/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err?.message || "Day image upload failed.");
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
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-1">
      <label className="block text-[11px] font-bold text-[#0B1026]">
        Day {dayNumber} Image <span className="text-gray-400 font-normal">(Optional)</span>
      </label>

      {value ? (
        <div className="relative w-full aspect-[16/9] max-h-48 rounded-xl overflow-hidden bg-gray-900 border border-[#E8ECF3] group shadow-xs">
          <Image
            src={value}
            alt={`Day ${dayNumber} Photo`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 500px"
          />
          <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white/90 hover:bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1 transition-all min-h-[36px] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1 transition-all min-h-[36px] cursor-pointer"
            >
              <X className="w-3 h-3" />
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
          className={`relative border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[100px] w-full ${
            isDragging
              ? "border-[#3478F6] bg-[#3478F6]/10"
              : "border-gray-300 bg-white hover:bg-gray-50"
          } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#3478F6]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Uploading day image...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <UploadCloud className="w-4 h-4 text-[#3478F6]" />
              <span>
                <span className="text-[#3478F6] font-bold">Upload Day {dayNumber} Photo</span> or drag and drop
              </span>
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
        <p role="alert" className="text-[11px] text-red-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

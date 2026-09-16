"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getOptimizedImageUrl, ImageVariant, getSafeImageUrl } from "@/lib/images";

export interface TravelImageProps {
  src?: string | null;
  alt: string;
  variant?: ImageVariant;
  fallbackSrc?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  draggable?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function TravelImage({
  src,
  alt,
  variant = "medium",
  fallbackSrc = "/images/logo/logoblack.png",
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className = "object-cover object-center",
  containerClassName = "",
  aspectRatio,
  draggable = false,
  onLoad,
  onError,
}: TravelImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initialUrl = getOptimizedImageUrl(src, { variant, fallback: fallbackSrc });
  const [currentSrc, setCurrentSrc] = useState(initialUrl);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(getOptimizedImageUrl(src, { variant, fallback: fallbackSrc }));
  }, [src, variant, fallbackSrc]);

  const handleImageError = () => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const wrapClasses = `relative overflow-hidden ${aspectRatio ? aspectRatio : fill ? "w-full h-full" : ""} ${containerClassName}`;

  return (
    <div className={wrapClasses}>
      {/* Skeleton / Loading Shimmer Placeholder to Prevent CLS */}
      {!isLoaded && (
        <div
          className="absolute inset-0 z-0 bg-slate-800/40 animate-pulse flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
        </div>
      )}

      {/* Main Responsive Next.js Image */}
      {fill ? (
        <Image
          src={currentSrc}
          alt={alt || "Dexplora travel destination"}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          draggable={draggable}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      ) : (
        <Image
          src={currentSrc}
          alt={alt || "Dexplora travel destination"}
          width={width || 400}
          height={height || 300}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          draggable={draggable}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </div>
  );
}

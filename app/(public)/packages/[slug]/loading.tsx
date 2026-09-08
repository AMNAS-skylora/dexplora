import React from "react";

export default function PackageDetailLoading() {
  return (
    <div className="w-full min-w-0 max-w-[1180px] mx-auto px-[clamp(14px,4vw,28px)] py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-12 animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-12 bg-gray-200 rounded-md" />
        <div className="h-3 w-3 bg-gray-200 rounded-full" />
        <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
        <div className="h-3 w-3 bg-gray-200 rounded-full" />
        <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
      </div>

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Package Content Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* Hero Image Skeleton */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] rounded-[18px] bg-gray-200 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-3 left-3 w-28 h-6 bg-gray-300 rounded-full" />
            <div className="absolute top-3 right-3 w-20 h-6 bg-gray-300 rounded-full" />
          </div>

          {/* Title & Introductory Section Skeleton */}
          <div className="space-y-3 min-w-0">
            <div className="h-8 sm:h-10 bg-gray-200 rounded-xl w-3/4" />
            <div className="h-4 bg-gray-200 rounded-lg w-full" />
            <div className="h-4 bg-gray-200 rounded-lg w-2/3" />

            {/* Meta Chips Row */}
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="h-8 w-24 bg-gray-200 rounded-xl" />
              <div className="h-8 w-20 bg-gray-200 rounded-xl" />
              <div className="h-8 w-32 bg-gray-200 rounded-xl" />
            </div>
          </div>

          {/* Pricing & Booking Card Skeleton */}
          <div className="bg-[#F8FAFF] rounded-[18px] border border-[#DBE6FF] p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-32 bg-gray-200 rounded-lg" />
              </div>
              <div className="flex justify-end">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
            </div>
            <div className="h-12 w-full bg-gray-300 rounded-xl" />
          </div>

          {/* Quick Features Bar Skeleton */}
          <div className="bg-white rounded-[16px] border border-[#E5EAF2] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 flex flex-col items-center">
                <div className="w-5 h-5 bg-gray-200 rounded-full" />
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          {/* Overview Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-6 w-36 bg-gray-200 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Upcoming Departures Calendar Skeleton */}
          <div className="bg-white rounded-[22px] border border-[#E5EAF2] p-4 sm:p-6 space-y-6">
            <div className="space-y-2 pb-4 border-b border-[#F1F5F9]">
              <div className="h-4 w-36 bg-gray-200 rounded-md" />
              <div className="h-7 w-64 bg-gray-200 rounded-lg" />
              <div className="h-4 w-80 bg-gray-200 rounded-md" />
            </div>

            {/* Month Controller Skeleton */}
            <div className="max-w-[460px] mx-auto bg-[#F8FAFC] rounded-[18px] border border-[#E5EAF2] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-gray-200 rounded-md" />
                <div className="flex gap-1">
                  <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                  <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                </div>
              </div>

              {/* Weekday Row */}
              <div className="grid grid-cols-7 gap-1 pb-2 border-b border-[#E5EAF2]">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded mx-auto w-6" />
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="w-full aspect-square rounded-xl bg-gray-200" />
                ))}
              </div>
            </div>

            {/* Selected Departure Card Skeleton */}
            <div className="bg-[#F8FAFF] rounded-[20px] border border-[#DBE6FF] p-5 space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-16 bg-gray-200 rounded-xl" />
                <div className="h-16 bg-gray-200 rounded-xl" />
                <div className="h-16 bg-gray-200 rounded-xl" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-8 w-28 bg-gray-200 rounded-lg" />
                <div className="h-12 w-40 bg-gray-300 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Desktop Sticky Booking Column (lg:col-span-4) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-[84px] bg-white rounded-[20px] border border-[#E5EAF2] p-6 space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-9 w-36 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="space-y-3 pt-2">
              <div className="h-12 w-full bg-gray-300 rounded-xl" />
              <div className="h-11 w-full bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

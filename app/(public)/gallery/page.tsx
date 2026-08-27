import { db } from "@/lib/db";
import { GalleryGrid } from "@/components/public/GalleryGrid";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Travel Gallery | Real Traveler Photos",
  description:
    "Explore real travel photography, destination highlights, and group trip moments from Dexplora Tour Planners across India.",
  alternates: {
    canonical: absoluteUrl("/gallery"),
  },
};

export default async function GalleryPage() {
  const images = await db.galleryImage.findMany({
    where: { published: true },
    include: {
      destination: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 min-[390px]:px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      {/* Page Header Intro */}
      <div className="space-y-1.5 py-1 sm:py-2 text-left sm:text-center max-w-2xl sm:mx-auto">
        <span className="text-[clamp(11px,3vw,13px)] font-bold uppercase tracking-[0.06em] text-[#3478F6] block">
          TRAVEL MEMORIES
        </span>
        <h1 className="text-[clamp(28px,8vw,46px)] font-bold text-[#0B1026] leading-[1.05] tracking-[-0.03em] break-words">
          Moments From Our Journeys
        </h1>
        <p className="text-[clamp(14px,3.8vw,17px)] text-[#64748B] leading-[1.5] font-normal mt-1 break-words">
          A glimpse of the destinations, experiences, and memories created with Dexplora travelers across India.
        </p>
      </div>

      {/* Gallery Grid & Lightbox Component */}
      <GalleryGrid images={images} />
    </div>
  );
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const slides = await db.heroSlide.findMany({
      where: {
        OR: [
          { isActive: true },
          { active: true },
        ],
      },
      orderBy: [
        { sortOrder: "asc" },
        { displayOrder: "asc" },
      ],
    });

    const now = new Date();

    const sanitizedSlides = slides
      .map((slide: any) => {
        const type = slide.type || (slide.eventId ? "EVENT" : "CUSTOM");

        if (type === "EVENT") {
          const event = slide.event;
          if (!event) return null;

          // Expiry check for EVENT slides
          if (
            event.status === "Completed" ||
            event.status === "Cancelled" ||
            (event.endDate && new Date(event.endDate) < now)
          ) {
            return null;
          }

          const pkg = event.package || {};
          const title = slide.title?.trim() || pkg.title || event.batchName || "Group Departure";
          const badgeTag = slide.badgeTag?.trim() || slide.badge?.trim() || "UPCOMING TRIP";
          
          let dateStr = "";
          if (event.startDate && event.endDate) {
            dateStr = `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`;
          }
          const durationStr = pkg.duration ? ` • ${pkg.duration}` : "";
          const subtitle = slide.subtitle?.trim() || (dateStr ? `${dateStr}${durationStr}` : pkg.shortDescription || "");

          const imageUrl = slide.imageUrl || pkg.coverImage || pkg.imageUrl || "";
          const startingPrice = Number(event.priceOverride) || Number(pkg.price) || Number(slide.startingPrice) || null;
          const realPrice = Number(pkg.realPrice) || Number(slide.realPrice) || null;
          const primaryBtnText = slide.ctaText?.trim() || "View Trip";
          const primaryBtnUrl = slide.ctaLink?.trim() || (pkg.slug ? `/packages/${pkg.slug}` : "/packages");

          return {
            id: slide.id,
            type: "EVENT",
            title,
            badgeTag,
            badge: badgeTag,
            subtitle,
            destination: event.arrivalDestination || pkg.destinationName || null,
            imageUrl,
            desktopImage: imageUrl,
            mobileImage: slide.mobileImage || null,
            startingPrice,
            realPrice,
            primaryBtnText,
            primaryBtnUrl,
            secondaryBtnText: "WhatsApp Us",
          };
        } else {
          // CUSTOM slide
          if (slide.endDate && new Date(slide.endDate) < now) {
            return null;
          }

          const imageUrl = slide.imageUrl || slide.desktopImage || "";
          return {
            id: slide.id,
            type: "CUSTOM",
            title: slide.title || "Special Tour Package",
            badgeTag: slide.badgeTag || slide.badge || "PROMOTION",
            badge: slide.badgeTag || slide.badge || "PROMOTION",
            subtitle: slide.subtitle || null,
            destination: slide.destination || null,
            imageUrl,
            desktopImage: imageUrl,
            mobileImage: slide.mobileImage || null,
            startingPrice: slide.startingPrice || null,
            realPrice: slide.realPrice || null,
            primaryBtnText: slide.ctaText || slide.primaryBtnText || "Explore Packages",
            primaryBtnUrl: slide.ctaLink || slide.primaryBtnUrl || "/packages",
            secondaryBtnText: "WhatsApp Us",
          };
        }
      })
      .filter(Boolean);

    return NextResponse.json(sanitizedSlides);
  } catch (error: any) {
    console.error("Public GET Hero Slides Error:", error);
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
  }
}

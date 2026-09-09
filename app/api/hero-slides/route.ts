import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
      return NextResponse.json({ slides: [], serverTime: new Date().toISOString() });
    }
    const slides = await db.heroSlide.findMany({
      where: {
        OR: [
          { isActive: true },
          { active: true },
        ],
      },
      include: {
        destination: true,
        package: {
          include: { destination: true },
        },
        event: {
          include: {
            destination: true,
            package: {
              include: { destination: true },
            },
          },
        },
      },
      orderBy: [
        { sortOrder: "asc" },
        { displayOrder: "asc" },
      ],
    });

    const now = new Date();
    const nowMs = now.getTime();

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

          const destinationName =
            event.destination?.name ||
            pkg.destination?.name ||
            slide.destination?.name ||
            event.arrivalDestination ||
            pkg.destinationName ||
            (typeof slide.destination === "string" ? slide.destination : null) ||
            null;

          return {
            id: slide.id,
            type: "EVENT",
            title,
            badgeTag,
            badge: badgeTag,
            subtitle,
            destination: destinationName,
            imageUrl,
            desktopImage: imageUrl,
            mobileImage: slide.mobileImage || null,
            videoUrl: slide.videoUrl || null,
            startingPrice,
            realPrice,
            currency: slide.currency || "INR",
            primaryBtnText,
            primaryBtnUrl,
            openInNewTab: Boolean(slide.openInNewTab),
            secondaryBtnText: "Book Seats Now",
            event,
            package: pkg,
          };
        } else if (type === "SCHEDULED_OFFER") {
          // SCHEDULED_OFFER slide
          if (!slide.startDate || !slide.endDate) return null;

          const startMs = new Date(slide.startDate).getTime();
          const endMs = new Date(slide.endDate).getTime();

          if (isNaN(startMs) || isNaN(endMs)) return null;

          // Strict server-side filter: currentTime >= startDateTime AND currentTime < endDateTime
          if (nowMs < startMs || nowMs >= endMs) {
            return null;
          }

          const pkg = slide.package || {};
          const title = slide.title?.trim() || pkg.title || "Limited Time Offer";
          const badgeTag = slide.badgeTag?.trim() || slide.badge?.trim() || "LIMITED OFFER";
          const subtitle = slide.subtitle?.trim() || pkg.shortDescription || "";

          const imageUrl = slide.imageUrl || slide.desktopImage || pkg.coverImage || pkg.imageUrl || "";
          const startingPrice = slide.startingPrice !== undefined && slide.startingPrice !== null ? Number(slide.startingPrice) : (pkg.price ? Number(pkg.price) : null);
          const realPrice = slide.realPrice !== undefined && slide.realPrice !== null ? Number(slide.realPrice) : (pkg.realPrice || pkg.originalPrice ? Number(pkg.realPrice || pkg.originalPrice) : null);
          const primaryBtnText = slide.ctaText?.trim() || "Book Now";
          const primaryBtnUrl = slide.ctaLink?.trim() || (pkg.slug ? `/packages/${pkg.slug}` : "/packages");

          const destinationName =
            slide.destination?.name ||
            pkg.destination?.name ||
            pkg.destinationName ||
            (typeof slide.destination === "string" ? slide.destination : null) ||
            null;

          return {
            id: slide.id,
            type: "SCHEDULED_OFFER",
            title,
            badgeTag,
            badge: badgeTag,
            subtitle,
            destination: destinationName,
            imageUrl,
            desktopImage: imageUrl,
            mobileImage: slide.mobileImage || null,
            videoUrl: slide.videoUrl || null,
            startingPrice,
            realPrice,
            currency: slide.currency || "INR",
            discountLabel: slide.discountLabel || null,
            offerPoints: Array.isArray(slide.offerPoints) ? slide.offerPoints : [],
            startDate: slide.startDate,
            endDate: slide.endDate,
            endDateTime: slide.endDate,
            showCountdown: slide.showCountdown !== undefined ? Boolean(slide.showCountdown) : true,
            showPrice: slide.showPrice !== undefined ? Boolean(slide.showPrice) : true,
            showPoints: slide.showPoints !== undefined ? Boolean(slide.showPoints) : true,
            showCTA: slide.showCTA !== undefined ? Boolean(slide.showCTA) : true,
            textAlignment: slide.textAlignment || "left",
            overlayStrength: slide.overlayStrength || "medium",
            primaryBtnText,
            primaryBtnUrl,
            openInNewTab: Boolean(slide.openInNewTab),
            secondaryBtnText: "Book Seats Now",
            package: pkg,
          };
        } else {
          // CUSTOM slide
          if (slide.endDate && new Date(slide.endDate) < now) {
            return null;
          }

          const imageUrl = slide.imageUrl || slide.desktopImage || "";
          const destinationName =
            slide.destination?.name ||
            (typeof slide.destination === "string" ? slide.destination : null) ||
            null;

          return {
            id: slide.id,
            type: "CUSTOM",
            title: slide.title || "Special Tour Package",
            badgeTag: slide.badgeTag || slide.badge || "PROMOTION",
            badge: slide.badgeTag || slide.badge || "PROMOTION",
            subtitle: slide.subtitle || null,
            destination: destinationName,
            imageUrl,
            desktopImage: imageUrl,
            mobileImage: slide.mobileImage || null,
            videoUrl: slide.videoUrl || null,
            startingPrice: slide.startingPrice || null,
            realPrice: slide.realPrice || null,
            currency: slide.currency || "INR",
            primaryBtnText: slide.ctaText || slide.primaryBtnText || "Explore Packages",
            primaryBtnUrl: slide.ctaLink || slide.primaryBtnUrl || "/packages",
            openInNewTab: Boolean(slide.openInNewTab),
            secondaryBtnText: "Book Seats Now",
          };
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      slides: sanitizedSlides,
      serverTime: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Public GET Hero Slides Error:", error);
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
  }
}

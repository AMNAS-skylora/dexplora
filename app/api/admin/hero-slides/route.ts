import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slides = await db.heroSlide.findMany({
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
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(slides);
  } catch (error: any) {
    console.error("GET Hero Slides Error:", error);
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const type = body.type === "EVENT" ? "EVENT" : body.type === "SCHEDULED_OFFER" ? "SCHEDULED_OFFER" : "CUSTOM";

    if (type === "EVENT") {
      if (!body.eventId) {
        return NextResponse.json({ error: "Upcoming Event is required for Event Slide" }, { status: 400 });
      }

      // Check if event exists
      const event = await db.tripBatch.findUnique({ where: { id: body.eventId }, include: { package: true } });
      if (!event) {
        return NextResponse.json({ error: "Selected Upcoming Event not found" }, { status: 400 });
      }

      // Check duplicate event slide
      const allSlides = await db.heroSlide.findMany();
      const existing = allSlides.find((s: any) => s.eventId === body.eventId);
      if (existing) {
        return NextResponse.json({ error: "This Upcoming Event is already added to Hero Slides." }, { status: 400 });
      }

      const parsedSortOrder = body.sortOrder !== undefined && body.sortOrder !== null ? Number(body.sortOrder) : 0;
      const activeState = body.isActive !== undefined ? Boolean(body.isActive) : true;

      const newSlide = await db.heroSlide.create({
        data: {
          type: "EVENT",
          eventId: body.eventId,
          title: body.title ? body.title.trim() : null,
          badgeTag: body.badgeTag ? body.badgeTag.trim() : null,
          subtitle: body.subtitle ? body.subtitle.trim() : null,
          imageUrl: body.imageUrl ? body.imageUrl.trim() : null,
          imagePublicId: body.imagePublicId ? body.imagePublicId.trim() : null,
          ctaText: body.ctaText ? body.ctaText.trim() : null,
          ctaLink: body.ctaLink ? body.ctaLink.trim() : null,
          isActive: activeState,
          active: activeState,
          sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
          displayOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        },
      });

      return NextResponse.json(newSlide, { status: 201 });
    } else if (type === "SCHEDULED_OFFER") {
      // SCHEDULED_OFFER Slide
      const {
        title,
        badgeTag,
        subtitle,
        destination,
        imageUrl,
        mobileImage,
        videoUrl,
        imagePublicId,
        startDate,
        endDate,
        startingPrice,
        realPrice,
        currency,
        discountLabel,
        offerPoints,
        ctaText,
        ctaLink,
        openInNewTab,
        showCountdown,
        showPrice,
        showPoints,
        showCTA,
        textAlignment,
        overlayStrength,
        packageId,
        isActive,
        sortOrder,
      } = body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Offer Title is required for scheduled offer slide" }, { status: 400 });
      }

      if (!startDate || !endDate) {
        return NextResponse.json({ error: "Start Date/Time and End Date/Time are required for scheduled offer" }, { status: 400 });
      }

      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      if (isNaN(startMs) || isNaN(endMs)) {
        return NextResponse.json({ error: "Invalid Start or End Date format" }, { status: 400 });
      }
      if (endMs <= startMs) {
        return NextResponse.json({ error: "End Date/Time must be after Start Date/Time" }, { status: 400 });
      }

      const parsedStartingPrice = startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
        ? Number(startingPrice)
        : null;
      const parsedRealPrice = realPrice !== undefined && realPrice !== null && realPrice !== ""
        ? Number(realPrice)
        : null;

      if (parsedStartingPrice !== null && (isNaN(parsedStartingPrice) || parsedStartingPrice < 0)) {
        return NextResponse.json({ error: "Offer Price cannot be negative" }, { status: 400 });
      }

      if (parsedRealPrice !== null && (isNaN(parsedRealPrice) || parsedRealPrice < 0)) {
        return NextResponse.json({ error: "Original Price cannot be negative" }, { status: 400 });
      }

      const parsedSortOrder = sortOrder !== undefined && sortOrder !== null ? Number(sortOrder) : 0;
      const activeState = isActive !== undefined ? Boolean(isActive) : true;
      const cleanPoints = Array.isArray(offerPoints) ? offerPoints.map((p: any) => String(p).trim()).filter(Boolean) : [];

      const newSlide = await db.heroSlide.create({
        data: {
          type: "SCHEDULED_OFFER",
          eventId: null,
          packageId: packageId ? String(packageId).trim() : null,
          title: title.trim(),
          badgeTag: badgeTag ? badgeTag.trim() : null,
          subtitle: subtitle ? subtitle.trim() : null,
          destination: destination ? destination.trim() : null,
          imageUrl: imageUrl ? imageUrl.trim() : null,
          desktopImage: imageUrl ? imageUrl.trim() : null,
          mobileImage: mobileImage ? mobileImage.trim() : null,
          videoUrl: videoUrl ? videoUrl.trim() : null,
          imagePublicId: imagePublicId ? imagePublicId.trim() : null,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          startingPrice: parsedStartingPrice,
          realPrice: parsedRealPrice,
          currency: currency ? currency.trim() : "INR",
          discountLabel: discountLabel ? discountLabel.trim() : null,
          offerPoints: cleanPoints,
          ctaText: ctaText ? ctaText.trim() : null,
          ctaLink: ctaLink ? ctaLink.trim() : null,
          openInNewTab: Boolean(openInNewTab),
          showCountdown: showCountdown !== undefined ? Boolean(showCountdown) : true,
          showPrice: showPrice !== undefined ? Boolean(showPrice) : true,
          showPoints: showPoints !== undefined ? Boolean(showPoints) : true,
          showCTA: showCTA !== undefined ? Boolean(showCTA) : true,
          textAlignment: textAlignment || "left",
          overlayStrength: overlayStrength || "medium",
          isActive: activeState,
          active: activeState,
          sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
          displayOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        },
      });

      return NextResponse.json(newSlide, { status: 201 });
    } else {
      // CUSTOM Slide
      const {
        title,
        badgeTag,
        subtitle,
        destination,
        imageUrl,
        mobileImage,
        imagePublicId,
        startDate,
        endDate,
        startingPrice,
        realPrice,
        ctaText,
        ctaLink,
        openInNewTab,
        isActive,
        sortOrder,
      } = body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Slide Title is required for custom slide" }, { status: 400 });
      }

      if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
        return NextResponse.json({ error: "Slide Hero Image is required for custom slide" }, { status: 400 });
      }

      const parsedStartingPrice = startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
        ? Number(startingPrice)
        : null;
      const parsedRealPrice = realPrice !== undefined && realPrice !== null && realPrice !== ""
        ? Number(realPrice)
        : null;

      if (parsedStartingPrice !== null && (isNaN(parsedStartingPrice) || parsedStartingPrice < 0)) {
        return NextResponse.json({ error: "Starting Price cannot be negative" }, { status: 400 });
      }

      if (parsedRealPrice !== null && (isNaN(parsedRealPrice) || parsedRealPrice < 0)) {
        return NextResponse.json({ error: "Real Price cannot be negative" }, { status: 400 });
      }

      if (parsedStartingPrice !== null && parsedRealPrice !== null && parsedRealPrice < parsedStartingPrice) {
        return NextResponse.json(
          { error: "Real Price (MRP) should be greater than or equal to Starting Price (Offer Price)" },
          { status: 400 }
        );
      }

      const parsedSortOrder = sortOrder !== undefined && sortOrder !== null ? Number(sortOrder) : 0;
      const activeState = isActive !== undefined ? Boolean(isActive) : true;

      const newSlide = await db.heroSlide.create({
        data: {
          type: "CUSTOM",
          eventId: null,
          title: title.trim(),
          badgeTag: badgeTag ? badgeTag.trim() : null,
          subtitle: subtitle ? subtitle.trim() : null,
          destination: destination ? destination.trim() : null,
          imageUrl: imageUrl.trim(),
          desktopImage: imageUrl.trim(),
          mobileImage: mobileImage ? mobileImage.trim() : null,
          imagePublicId: imagePublicId ? imagePublicId.trim() : null,
          startDate: startDate || null,
          endDate: endDate || null,
          startingPrice: parsedStartingPrice,
          realPrice: parsedRealPrice,
          ctaText: ctaText ? ctaText.trim() : null,
          ctaLink: ctaLink ? ctaLink.trim() : null,
          openInNewTab: Boolean(openInNewTab),
          isActive: activeState,
          active: activeState,
          sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
          displayOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        },
      });

      return NextResponse.json(newSlide, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST Hero Slide Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create hero slide" }, { status: 500 });
  }
}

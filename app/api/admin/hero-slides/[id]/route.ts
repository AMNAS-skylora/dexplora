import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingSlide = await db.heroSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const type = body.type || existingSlide.type || (existingSlide.eventId ? "EVENT" : "CUSTOM");

    if (type === "EVENT") {
      const eventId = body.eventId || existingSlide.eventId;
      if (!eventId) {
        return NextResponse.json({ error: "Upcoming Event is required for Event Slide" }, { status: 400 });
      }

      const parsedSortOrder = body.sortOrder !== undefined && body.sortOrder !== null
        ? Number(body.sortOrder)
        : (existingSlide.sortOrder ?? 0);
      const activeState = body.isActive !== undefined ? Boolean(body.isActive) : (existingSlide.isActive ?? true);

      const updatedSlide = await db.heroSlide.update({
        where: { id },
        data: {
          type: "EVENT",
          eventId,
          title: body.title !== undefined ? (body.title ? body.title.trim() : null) : existingSlide.title,
          badgeTag: body.badgeTag !== undefined ? (body.badgeTag ? body.badgeTag.trim() : null) : existingSlide.badgeTag,
          subtitle: body.subtitle !== undefined ? (body.subtitle ? body.subtitle.trim() : null) : existingSlide.subtitle,
          imageUrl: body.imageUrl !== undefined ? (body.imageUrl ? body.imageUrl.trim() : null) : existingSlide.imageUrl,
          imagePublicId: body.imagePublicId !== undefined ? (body.imagePublicId ? body.imagePublicId.trim() : null) : existingSlide.imagePublicId,
          ctaText: body.ctaText !== undefined ? (body.ctaText ? body.ctaText.trim() : null) : existingSlide.ctaText,
          ctaLink: body.ctaLink !== undefined ? (body.ctaLink ? body.ctaLink.trim() : null) : existingSlide.ctaLink,
          isActive: activeState,
          active: activeState,
          sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
          displayOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        },
      });

      return NextResponse.json(updatedSlide);
    } else if (type === "SCHEDULED_OFFER") {
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

      const finalTitle = title !== undefined ? String(title).trim() : existingSlide.title;
      if (!finalTitle) {
        return NextResponse.json({ error: "Offer Title is required for scheduled offer slide" }, { status: 400 });
      }

      const finalStartDate = startDate !== undefined ? startDate : existingSlide.startDate;
      const finalEndDate = endDate !== undefined ? endDate : existingSlide.endDate;
      if (!finalStartDate || !finalEndDate) {
        return NextResponse.json({ error: "Start Date/Time and End Date/Time are required for scheduled offer" }, { status: 400 });
      }

      const startMs = new Date(finalStartDate).getTime();
      const endMs = new Date(finalEndDate).getTime();
      if (isNaN(startMs) || isNaN(endMs)) {
        return NextResponse.json({ error: "Invalid Start or End Date format" }, { status: 400 });
      }
      if (endMs <= startMs) {
        return NextResponse.json({ error: "End Date/Time must be after Start Date/Time" }, { status: 400 });
      }

      const parsedStartingPrice = startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
        ? Number(startingPrice)
        : existingSlide.startingPrice;
      const parsedRealPrice = realPrice !== undefined && realPrice !== null && realPrice !== ""
        ? Number(realPrice)
        : existingSlide.realPrice;

      if (parsedStartingPrice !== null && (isNaN(parsedStartingPrice) || parsedStartingPrice < 0)) {
        return NextResponse.json({ error: "Offer Price cannot be negative" }, { status: 400 });
      }

      if (parsedRealPrice !== null && (isNaN(parsedRealPrice) || parsedRealPrice < 0)) {
        return NextResponse.json({ error: "Original Price cannot be negative" }, { status: 400 });
      }

      const parsedSortOrder = sortOrder !== undefined && sortOrder !== null
        ? Number(sortOrder)
        : (existingSlide.sortOrder ?? 0);
      const activeState = isActive !== undefined ? Boolean(isActive) : (existingSlide.isActive ?? true);
      const cleanPoints = offerPoints !== undefined
        ? (Array.isArray(offerPoints) ? offerPoints.map((p: any) => String(p).trim()).filter(Boolean) : [])
        : existingSlide.offerPoints;

      const updatedSlide = await db.heroSlide.update({
        where: { id },
        data: {
          type: "SCHEDULED_OFFER",
          eventId: null,
          packageId: packageId !== undefined ? (packageId ? String(packageId).trim() : null) : existingSlide.packageId,
          title: finalTitle,
          badgeTag: badgeTag !== undefined ? (badgeTag ? String(badgeTag).trim() : null) : existingSlide.badgeTag,
          subtitle: subtitle !== undefined ? (subtitle ? String(subtitle).trim() : null) : existingSlide.subtitle,
          destination: destination !== undefined ? (destination ? String(destination).trim() : null) : existingSlide.destination,
          imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : existingSlide.imageUrl,
          desktopImage: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : existingSlide.desktopImage,
          mobileImage: mobileImage !== undefined ? (mobileImage ? String(mobileImage).trim() : null) : existingSlide.mobileImage,
          videoUrl: videoUrl !== undefined ? (videoUrl ? String(videoUrl).trim() : null) : existingSlide.videoUrl,
          imagePublicId: imagePublicId !== undefined ? (imagePublicId ? String(imagePublicId).trim() : null) : existingSlide.imagePublicId,
          startDate: new Date(finalStartDate).toISOString(),
          endDate: new Date(finalEndDate).toISOString(),
          startingPrice: parsedStartingPrice,
          realPrice: parsedRealPrice,
          currency: currency !== undefined ? (currency ? String(currency).trim() : "INR") : (existingSlide.currency || "INR"),
          discountLabel: discountLabel !== undefined ? (discountLabel ? String(discountLabel).trim() : null) : existingSlide.discountLabel,
          offerPoints: cleanPoints,
          ctaText: ctaText !== undefined ? (ctaText ? String(ctaText).trim() : null) : existingSlide.ctaText,
          ctaLink: ctaLink !== undefined ? (ctaLink ? String(ctaLink).trim() : null) : existingSlide.ctaLink,
          openInNewTab: openInNewTab !== undefined ? Boolean(openInNewTab) : Boolean(existingSlide.openInNewTab),
          showCountdown: showCountdown !== undefined ? Boolean(showCountdown) : (existingSlide.showCountdown ?? true),
          showPrice: showPrice !== undefined ? Boolean(showPrice) : (existingSlide.showPrice ?? true),
          showPoints: showPoints !== undefined ? Boolean(showPoints) : (existingSlide.showPoints ?? true),
          showCTA: showCTA !== undefined ? Boolean(showCTA) : (existingSlide.showCTA ?? true),
          textAlignment: textAlignment !== undefined ? textAlignment : (existingSlide.textAlignment || "left"),
          overlayStrength: overlayStrength !== undefined ? overlayStrength : (existingSlide.overlayStrength || "medium"),
          isActive: activeState,
          active: activeState,
          sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
          displayOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        },
      });

      return NextResponse.json(updatedSlide);
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

      const finalTitle = title !== undefined ? title.trim() : existingSlide.title;
      if (!finalTitle) {
        return NextResponse.json({ error: "Slide Title is required for custom slide" }, { status: 400 });
      }

      const finalImageUrl = imageUrl !== undefined ? imageUrl.trim() : (existingSlide.imageUrl || existingSlide.desktopImage);
      if (!finalImageUrl) {
        return NextResponse.json({ error: "Slide Hero Image is required for custom slide" }, { status: 400 });
      }

      const parsedStartingPrice = startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
        ? Number(startingPrice)
        : existingSlide.startingPrice;
      const parsedRealPrice = realPrice !== undefined && realPrice !== null && realPrice !== ""
        ? Number(realPrice)
        : existingSlide.realPrice;

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

      const parsedSortOrder = sortOrder !== undefined && sortOrder !== null
        ? Number(sortOrder)
        : (existingSlide.sortOrder ?? 0);
      const activeState = isActive !== undefined ? Boolean(isActive) : (existingSlide.isActive ?? true);
      const oldPublicId = existingSlide.imagePublicId;

      const updatedSlide = await db.heroSlide.update({
        where: { id },
        data: {
          type: "CUSTOM",
          eventId: null,
          title: finalTitle,
          badgeTag: badgeTag !== undefined ? (badgeTag ? badgeTag.trim() : null) : existingSlide.badgeTag,
          subtitle: subtitle !== undefined ? (subtitle ? subtitle.trim() : null) : existingSlide.subtitle,
          destination: destination !== undefined ? (destination ? destination.trim() : null) : existingSlide.destination,
          imageUrl: finalImageUrl,
          desktopImage: finalImageUrl,
          mobileImage: mobileImage !== undefined ? (mobileImage ? mobileImage.trim() : null) : existingSlide.mobileImage,
          imagePublicId: imagePublicId !== undefined ? (imagePublicId ? imagePublicId.trim() : null) : existingSlide.imagePublicId,
          startDate: startDate !== undefined ? (startDate || null) : existingSlide.startDate,
          endDate: endDate !== undefined ? (endDate || null) : existingSlide.endDate,
          startingPrice: parsedStartingPrice,
          realPrice: parsedRealPrice,
          ctaText: ctaText !== undefined ? (ctaText ? ctaText.trim() : null) : existingSlide.ctaText,
          ctaLink: ctaLink !== undefined ? (ctaLink ? ctaLink.trim() : null) : existingSlide.ctaLink,
          openInNewTab: openInNewTab !== undefined ? Boolean(openInNewTab) : Boolean(existingSlide.openInNewTab),
          isActive: activeState,
          active: activeState,
          sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
          displayOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        },
      });

      // Safely delete old Cloudinary image if replaced
      const newPublicId = imagePublicId || existingSlide.imagePublicId;
      if (oldPublicId && newPublicId && oldPublicId !== newPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (cloudErr) {
          console.error("Failed to delete previous Cloudinary image:", cloudErr);
        }
      }

      return NextResponse.json(updatedSlide);
    }
  } catch (error: any) {
    console.error("PUT Hero Slide Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update hero slide" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingSlide = await db.heroSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
      updateData.active = Boolean(body.isActive);
    }
    if (body.sortOrder !== undefined) {
      const parsedOrder = Number(body.sortOrder);
      if (!isNaN(parsedOrder)) {
        updateData.sortOrder = parsedOrder;
        updateData.displayOrder = parsedOrder;
      }
    }

    const updatedSlide = await db.heroSlide.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSlide);
  } catch (error: any) {
    console.error("PATCH Hero Slide Error:", error);
    return NextResponse.json({ error: "Failed to update slide status/order" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingSlide = await db.heroSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    await db.heroSlide.delete({
      where: { id },
    });

    // Delete Cloudinary custom image asset ONLY if this is a custom slide
    const isCustom = (existingSlide.type || (existingSlide.eventId ? "EVENT" : "CUSTOM")) === "CUSTOM";
    if (isCustom && existingSlide.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(existingSlide.imagePublicId);
      } catch (cloudErr) {
        console.error("Failed to delete Cloudinary asset:", cloudErr);
      }
    }

    return NextResponse.json({ success: true, message: "Hero slide removed successfully" });
  } catch (error: any) {
    console.error("DELETE Hero Slide Error:", error);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}

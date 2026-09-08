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
    } else {
      // CUSTOM Slide
      const {
        title,
        badgeTag,
        subtitle,
        destination,
        imageUrl,
        imagePublicId,
        startDate,
        endDate,
        startingPrice,
        realPrice,
        ctaText,
        ctaLink,
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
          imagePublicId: imagePublicId !== undefined ? (imagePublicId ? imagePublicId.trim() : null) : existingSlide.imagePublicId,
          startDate: startDate !== undefined ? (startDate || null) : existingSlide.startDate,
          endDate: endDate !== undefined ? (endDate || null) : existingSlide.endDate,
          startingPrice: parsedStartingPrice,
          realPrice: parsedRealPrice,
          ctaText: ctaText !== undefined ? (ctaText ? ctaText.trim() : null) : existingSlide.ctaText,
          ctaLink: ctaLink !== undefined ? (ctaLink ? ctaLink.trim() : null) : existingSlide.ctaLink,
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

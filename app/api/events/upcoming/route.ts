import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [batches, customEvents] = await Promise.all([
      db.tripBatch.findMany({
        where: {
          startDate: { gte: today },
        },
        include: {
          package: {
            include: { destination: true },
          },
        },
        orderBy: { startDate: "asc" },
      }),
      db.calendarEvent.findMany({
        where: {
          isActive: true,
          startDate: { gte: today },
        },
        include: {
          package: {
            include: { destination: true },
          },
        },
        orderBy: { startDate: "asc" },
      }),
    ]);

    const filterActiveBatches = batches.filter(
      (b: any) =>
        b.status !== "CANCELLED" &&
        b.status !== "COMPLETED" &&
        (!b.package || b.package.status === "PUBLISHED" || b.package.status === undefined)
    );

    const events = filterActiveBatches.map((b: any) => {
      const total = b.totalSeats || 30;
      const avail = b.availableSeats !== undefined ? b.availableSeats : 30;
      let calcStatus = b.status || "OPEN";
      if (avail <= 0) calcStatus = "SOLD_OUT";

      return {
        id: b.id,
        title: b.batchName ? `${b.package?.title || "Group Trip"} (${b.batchName})` : (b.package?.title || "Group Trip"),
        slug: b.package?.slug || "trip",
        destinationName: b.package?.destination?.name || "India",
        startDate: b.startDate,
        endDate: b.endDate,
        price: b.priceOverride || b.package?.sellingPrice || b.package?.startingPrice || b.package?.price || 0,
        originalPrice: b.package?.realPrice || b.package?.originalPrice || null,
        totalSeats: total,
        availableSeats: avail,
        status: calcStatus,
        duration: b.package?.duration || "Multi-day",
        image: b.package?.coverImage || b.package?.imageUrl || null,
        departureLocation: b.package?.departureLocation || "Kochi / Kerala",
        package: b.package
          ? {
              id: b.package.id,
              slug: b.package.slug,
              title: b.package.title,
            }
          : null,
      };
    });

    return NextResponse.json(
      { success: true, events },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Public Upcoming Events API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch upcoming events", events: [] },
      { status: 500 }
    );
  }
}

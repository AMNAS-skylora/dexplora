import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { createTripBatch, deleteTripBatch, updateTripBatch } from "@/actions";
import { Plus, Trash2, Calendar, Users, MapPin, ArrowRight, Eye, Edit, Search, Filter, IndianRupee } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { UpcomingTripManagerClient } from "./UpcomingTripManagerClient";

export const revalidate = 0;

export default async function AdminUpcomingTripsPage() {
  const [batches, packages] = await Promise.all([
    db.tripBatch.findMany({
      include: { package: true, bookings: true },
      orderBy: { startDate: "asc" },
    }),
    db.package.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, price: true, duration: true, coverImage: true, departureLocation: true, arrivalLocation: true },
    }),
  ]);

  // Enrich batches with metrics
  const enrichedBatches = batches.map((b: any) => {
    const pkg = b.package || {};
    const bookings = Array.isArray(b.bookings) ? b.bookings : [];
    const activeBookings = bookings.filter((bk: any) => bk.bookingStatus !== "Cancelled" && bk.status !== "CANCELLED");

    const totalTravellers = activeBookings.reduce((sum: number, bk: any) => sum + (bk.travellerCount || 1), 0);
    const totalRevenue = activeBookings.reduce((sum: number, bk: any) => sum + (Number(bk.totalAmount) || 0), 0);
    const collectedAmount = activeBookings.reduce((sum: number, bk: any) => sum + (Number(bk.paidAmount) || 0), 0);
    const pendingAmount = Math.max(0, totalRevenue - collectedAmount);

    const bookedSeats = totalTravellers;
    const totalSeats = Number(b.totalSeats) || 30;
    const availableSeats = Math.max(0, totalSeats - bookedSeats);

    let derivedStatus = b.status || "OPEN";
    if (availableSeats === 0) derivedStatus = "SOLD_OUT";

    return {
      ...b,
      packageTitle: pkg.title || "Package not set",
      packageCoverImage: pkg.coverImage || "/placeholder.jpg",
      duration: pkg.duration || "N/A",
      departurePoint: b.boardingPoint || pkg.departureLocation || "Kerala",
      arrivalDestination: b.arrivalDestination || pkg.arrivalLocation || "Destination",
      bookedSeats,
      availableSeats,
      totalSeats,
      status: derivedStatus,
      bookingsCount: activeBookings.length,
      totalTravellers,
      totalRevenue,
      collectedAmount,
      pendingAmount,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026]">
            Upcoming Trip Events & Departure Batches
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Manage scheduled group departures, seat capacities, traveller manifests, and payment tracking.
          </p>
        </div>
      </div>

      <UpcomingTripManagerClient batches={enrichedBatches} packages={packages} />
    </div>
  );
}

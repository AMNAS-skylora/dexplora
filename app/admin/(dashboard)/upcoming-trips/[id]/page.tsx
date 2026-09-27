import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventDetailsClient } from "./EventDetailsClient";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const [batch, packages, eventExpenses] = await Promise.all([
    db.tripBatch.findUnique({
      where: { id },
      include: { package: true, bookings: true },
    }),
    db.package.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, price: true, duration: true },
    }),
    db.expense.findMany({
      where: { tripBatchId: id },
      orderBy: { expenseDate: "desc" },
    }),
  ]);

  if (!batch) {
    notFound();
  }

  // Ensure safe relation
  const pkg = batch.package || {};
  const bookings = Array.isArray(batch.bookings) ? batch.bookings : [];

  const enrichedBatch = {
    ...batch,
    packageTitle: pkg.title || "Package not set",
    packageCoverImage: pkg.coverImage || "/placeholder.jpg",
    packagePrice: pkg.price || 0,
    packageExpensePerPerson: Number(pkg.expensePerPerson) || 0,
    eventExpenses: Array.isArray(eventExpenses) ? eventExpenses : [],
    duration: pkg.duration || "N/A",
    departurePoint: batch.boardingPoint || pkg.departureLocation || "Kerala",
    arrivalDestination: batch.arrivalDestination || pkg.arrivalLocation || "Destination",
    bookings,
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <EventDetailsClient batch={enrichedBatch} packages={packages} />
    </div>
  );
}

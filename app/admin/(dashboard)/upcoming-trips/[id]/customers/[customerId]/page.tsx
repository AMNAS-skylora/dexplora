import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "./CustomerDetailClient";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; customerId: string }>;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id: eventId, customerId } = await params;

  const [batch, booking] = await Promise.all([
    db.tripBatch.findUnique({
      where: { id: eventId },
      include: { package: true },
    }),
    db.booking.findUnique({
      where: { id: customerId },
    }),
  ]);

  if (!batch || !booking) {
    notFound();
  }

  const pkg = batch.package || {};

  const enrichedBatch = {
    id: batch.id,
    packageTitle: pkg.title || "Package not set",
    batchName: batch.batchName || "Standard Departure",
    startDate: batch.startDate,
    endDate: batch.endDate,
    departurePoint: batch.boardingPoint || pkg.departureLocation || "Kerala",
    arrivalDestination: batch.arrivalDestination || pkg.arrivalLocation || "Destination",
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <CustomerDetailClient event={enrichedBatch} customer={booking} />
    </div>
  );
}

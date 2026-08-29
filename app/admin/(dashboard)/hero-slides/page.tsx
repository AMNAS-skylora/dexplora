import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HeroSlidesClientManager } from "@/components/admin/HeroSlidesClientManager";

export const revalidate = 0;

export default async function AdminHeroSlidesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [initialSlides, upcomingEvents] = await Promise.all([
    db.heroSlide.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { displayOrder: "asc" },
      ],
    }),
    db.tripBatch.findMany({
      include: { package: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const sanitizedEvents = upcomingEvents.map((b: any) => {
    const pkg = b.package || {};
    return {
      id: b.id,
      packageId: b.packageId,
      packageTitle: pkg.title || b.packageTitle || "Group Departure",
      batchName: b.batchName || "Standard Batch",
      destination: b.arrivalDestination || pkg.arrivalLocation || "India",
      startDate: b.startDate,
      endDate: b.endDate,
      duration: pkg.duration || "6 Days / 5 Nights",
      coverImage: pkg.coverImage || pkg.imageUrl || "",
      offerPrice: Number(b.priceOverride) || Number(pkg.price) || 0,
      realPrice: Number(pkg.realPrice) || null,
      availableSeats: b.availableSeats ?? (b.totalSeats - (b.bookedSeats || 0)),
      totalSeats: b.totalSeats || 20,
      status: b.status || "OPEN",
    };
  });

  return (
    <HeroSlidesClientManager
      initialSlides={initialSlides}
      upcomingEvents={sanitizedEvents}
    />
  );
}

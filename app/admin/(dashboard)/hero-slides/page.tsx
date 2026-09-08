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

  const [initialSlides, upcomingEvents, destinations] = await Promise.all([
    db.heroSlide.findMany({
      include: {
        destination: true,
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
    }),
    db.tripBatch.findMany({
      include: {
        destination: true,
        package: {
          include: { destination: true },
        },
      },
      orderBy: { startDate: "asc" },
    }),
    db.destination.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const sanitizedEvents = upcomingEvents.map((b: any) => {
    const pkg = b.package || {};
    const destName =
      b.destination?.name ||
      pkg.destination?.name ||
      b.arrivalDestination ||
      pkg.destinationName ||
      "";

    return {
      id: b.id,
      packageId: b.packageId,
      packageTitle: pkg.title || b.packageTitle || "Group Departure",
      batchName: b.batchName || "Standard Batch",
      destination: destName,
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
      destinations={destinations}
    />
  );
}

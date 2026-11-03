import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { BookingForm } from "@/components/public/BookingForm";

export const dynamic = "force-dynamic";

interface BookNowPageProps {
  searchParams: Promise<{ packageId?: string; batchId?: string }>;
}

export default async function BookNowPage({ searchParams }: BookNowPageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();

  let packages: any[] = [];
  try {
    const packageRecords = await db.package.findMany({
      where: { status: { in: ["PUBLISHED", "SOLD_OUT"] } },
      include: { batches: true },
      orderBy: { displayOrder: "asc" },
    });
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    packages = (Array.isArray(packageRecords) ? packageRecords : []).map((pkg: any) => ({
      id: pkg.id,
      status: pkg.status,
      title: pkg.title,
      slug: pkg.slug,
      price: Number(pkg.price) || 0,
      batches: (Array.isArray(pkg.batches) ? pkg.batches : [])
        .filter((batch: any) =>
          new Date(batch.startDate).getTime() >= now.getTime() &&
          !["CANCELLED", "COMPLETED"].includes(String(batch.status))
        )
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map((batch: any) => ({
          id: batch.id,
          batchName: batch.batchName,
          startDate: batch.startDate,
          endDate: batch.endDate,
          priceOverride: batch.priceOverride ?? null,
          totalSeats: batch.totalSeats,
          availableSeats: batch.availableSeats,
          status: batch.status,
        })),
    })).filter((pkg: any) =>
      pkg.status === "PUBLISHED" ||
      pkg.batches.some((batch: any) =>
        batch.availableSeats > 0 && batch.status !== "SOLD_OUT"
      )
    );
  } catch (error) {
    console.error("Error fetching packages for booking form:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">Reserve Your Journey</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1026]">
          Book Your Adventure With Dexplora
        </h1>
        <p className="text-sm text-[#667085]">
          Submit your travel details below to reserve your seats for our upcoming departures. Zero advance fee required for enquiry!
        </p>
      </div>

      <BookingForm
        packages={packages}
        initialPackageSlug={params.packageId}
        initialBatchId={params.batchId}
        whatsappNumber={settings.whatsapp_number}
      />
    </div>
  );
}

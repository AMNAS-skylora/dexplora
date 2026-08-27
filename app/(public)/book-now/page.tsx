import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { BookingForm } from "@/components/public/BookingForm";

export const revalidate = 60;

interface BookNowPageProps {
  searchParams: Promise<{ packageId?: string; batchId?: string }>;
}

export default async function BookNowPage({ searchParams }: BookNowPageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();

  const packages = await db.package.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      batches: {
        where: { startDate: { gte: new Date() } },
        select: {
          id: true,
          batchName: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

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

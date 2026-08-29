import { db } from "@/lib/db";
import { PackageForm } from "@/components/admin/PackageForm";
import { notFound } from "next/navigation";

export const revalidate = 0;

interface EditPackagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params;

  const [pkg, destinations] = await Promise.all([
    db.package.findUnique({
      where: { id },
      include: {
        images: true,
        itineraries: { orderBy: { dayNumber: "asc" } },
        inclusions: { orderBy: { displayOrder: "asc" } },
        exclusions: { orderBy: { displayOrder: "asc" } },
        faqs: { orderBy: { displayOrder: "asc" } },
      },
    }),
    db.destination.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!pkg) {
    notFound();
  }

  return <PackageForm destinations={destinations} initialData={pkg} />;
}

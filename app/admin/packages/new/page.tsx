import { db } from "@/lib/db";
import { PackageForm } from "@/components/admin/PackageForm";

export const revalidate = 0;

export default async function NewPackagePage() {
  const destinations = await db.destination.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return <PackageForm destinations={destinations} />;
}

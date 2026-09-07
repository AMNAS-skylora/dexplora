import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getArchiveStatusSummary } from "@/actions";
import { ArchiveManagerClient } from "./ArchiveManagerClient";

export const revalidate = 0;

export default async function AdminArchivesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const summary = await getArchiveStatusSummary();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <ArchiveManagerClient initialData={summary} />
    </div>
  );
}

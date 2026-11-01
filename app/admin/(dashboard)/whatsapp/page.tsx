import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWhatsAppTrips } from "@/actions/whatsapp";
import { WhatsAppManager } from "@/components/admin/WhatsAppManager";
export const dynamic = "force-dynamic";
export default async function WhatsAppPage() {
  if (!(await getAdminSession())) redirect("/admin/login");
  const trips = await getWhatsAppTrips();
  return <WhatsAppManager trips={trips} configured={Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)} />;
}

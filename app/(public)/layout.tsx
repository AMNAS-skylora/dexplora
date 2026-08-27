import { getSiteSettings } from "@/lib/settings";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp number={settings.whatsapp_number} />
    </div>

  );
}

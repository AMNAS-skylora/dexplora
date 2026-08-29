import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <div className="h-screen w-full bg-[#F3F7FF] flex overflow-hidden">
      {/* Fixed Desktop Sidebar (>= 1024px) */}
      <div className="hidden lg:block shrink-0 h-full w-64">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <AdminHeader session={session} />
        
        {/* Scrollable Page Content with Mobile Safe Bottom Padding */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto min-h-0 pb-[calc(84px+env(safe-area-inset-bottom,0px))] md:pb-8">
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation (< 768px) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/actions";
import { BrandLogo } from "@/components/public/BrandLogo";
import {
  LayoutDashboard,
  Package,
  Calendar,
  MapPin,
  Sliders,
  Image as ImageIcon,
  MessageSquare,
  BookmarkCheck,
  Mail,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Upcoming Trips", href: "/admin/upcoming-trips", icon: Calendar },
    { name: "Destinations", href: "/admin/destinations", icon: MapPin },
    { name: "Hero Slides", href: "/admin/hero-slides", icon: Sliders },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Bookings", href: "/admin/bookings", icon: BookmarkCheck },
    { name: "Enquiries", href: "/admin/enquiries", icon: Mail },
    { name: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  async function handleLogout() {
    await logoutAdmin();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-[#050A24] text-white flex flex-col justify-between h-full overflow-y-auto p-4 border-r border-white/10 shrink-0">
      <div className="space-y-6">
        {/* Desktop Sidebar Logo Container */}
        <div className="h-[88px] px-2 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link href="/admin/dashboard" className="inline-flex items-center shrink-0 min-w-0">
            <BrandLogo variant="admin" />
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const IconComponent = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#3478F6] text-white shadow-md font-bold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          View Public Site
        </Link>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

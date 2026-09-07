"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/actions";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Image as ImageIcon,
  Grid3x3,
  MapPin,
  Sliders,
  MessageSquare,
  BookmarkCheck,
  Mail,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Trips", href: "/admin/upcoming-trips", icon: Calendar },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  ];

  const moreLinks = [
    { name: "Destinations", href: "/admin/destinations", icon: MapPin },
    { name: "Hero Slides", href: "/admin/hero-slides", icon: Sliders },
    { name: "Instagram Feed", href: "/admin/instagram", icon: InstagramIcon },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Bookings", href: "/admin/bookings", icon: BookmarkCheck },
    { name: "Enquiries", href: "/admin/enquiries", icon: Mail },
    { name: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  const isMoreActive = moreLinks.some((l) => pathname.startsWith(l.href));

  async function handleLogout() {
    setIsMoreOpen(false);
    await logoutAdmin();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Fixed Mobile Bottom Bar (< 768px / md:hidden) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#050A24] border-t border-white/10 text-white md:hidden shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid grid-cols-5 h-[66px] items-center px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[54px] cursor-pointer ${
                  isActive ? "text-[#3478F6] font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 shrink-0 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                <span className="text-[11px] leading-none tracking-tight">{tab.name}</span>
              </Link>
            );
          })}

          {/* More Tab Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[54px] cursor-pointer ${
              isMoreActive || isMoreOpen ? "text-[#3478F6] font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Grid3x3 className={`w-5 h-5 mb-1 shrink-0 ${isMoreActive || isMoreOpen ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[11px] leading-none tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* More Options Bottom Drawer Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden flex flex-col justify-end">
          <div
            className="bg-[#050A24] border-t border-white/15 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                Admin Control Menu
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Additional Menu Items */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-[#3478F6] text-white border-[#3478F6] shadow-md"
                        : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Public Site & Logout Actions */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsMoreOpen(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Public Website</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

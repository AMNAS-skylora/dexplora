"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Send } from "lucide-react";
import { SiteSettingsMap } from "@/lib/settings";
import { BrandLogo } from "@/components/public/BrandLogo";
import { openWhatsAppBooking } from "@/lib/whatsapp";

interface HeaderProps {
  settings: SiteSettingsMap;
}

export function Header({ settings }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Packages", href: "/packages" },
    { name: "Upcoming Trips", href: "/upcoming-trips" },
    { name: "Gallery", href: "/gallery" },
    { name: "Reviews", href: "/reviews" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-[#E8ECF3] ${
        scrolled ? "py-2.5 shadow-sm" : "py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center shrink-0 min-w-0">
            <BrandLogo priority variant="header" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors relative py-1 shrink-0 ${
                    isActive ? "text-[#3478F6]" : "text-[#0B1026] hover:text-[#3478F6]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3478F6] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <a
              href={`tel:${settings.phone_1.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 text-xs font-semibold text-[#0B1026] hover:text-[#3478F6] bg-[#F3F7FF] px-3 py-2 rounded-lg transition-colors min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>{settings.phone_1}</span>
            </a>

            <button
              type="button"
              onClick={() =>
                openWhatsAppBooking({
                  whatsappNumber: settings.whatsapp_number,
                  fallbackPhoneNumber: settings.phone_1,
                })
              }
              className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-[#0B1026] hover:bg-[#F3F7FF] transition-colors focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="w-6 h-6 text-[#3478F6]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] sm:top-[65px] bottom-0 z-40 bg-white flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 overflow-y-auto border-t border-[#E8ECF3] shadow-2xl">
          <div className="space-y-1 pt-2">
            <p className="text-xs font-bold tracking-wider text-[#667085] uppercase mb-3 px-2">Navigation Menu</p>
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    animationDelay: `${idx * 40}ms`,
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-base transition-all active:scale-98 min-h-[44px] ${
                    isActive
                      ? "bg-[#F3F7FF] text-[#3478F6] font-bold"
                      : "text-[#0B1026] hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[#3478F6]" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-5 pb-6 border-t border-[#E8ECF3] space-y-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openWhatsAppBooking({
                  whatsappNumber: settings.whatsapp_number,
                  fallbackPhoneNumber: settings.phone_1,
                });
              }}
              className="w-full bg-[#3478F6] text-white py-3.5 rounded-xl font-bold text-center flex items-center justify-center shadow-md hover:bg-[#2563EB] transition-colors text-base min-h-[48px] cursor-pointer"
            >
              Book Now
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=Hi%20Dexplora,%20I%20have%20an%20enquiry`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#16A36A] text-white py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-sm text-base min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp Assistance</span>
            </a>

            <div className="text-center pt-2">
              <span className="text-xs text-[#667085]">Call Us Direct: </span>
              <a href={`tel:${settings.phone_1}`} className="text-xs font-bold text-[#0B1026] hover:text-[#3478F6] inline-block p-1">
                {settings.phone_1}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

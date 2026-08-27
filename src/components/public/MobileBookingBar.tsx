"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface MobileBookingBarProps {
  packageSlug: string;
  packageTitle: string;
  price: number;
  whatsappNumber: string;
  phoneNumber?: string;
}

export function MobileBookingBar({
  packageSlug,
  packageTitle,
  price,
  whatsappNumber,
}: MobileBookingBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 220);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hi%20Dexplora,%20I%20want%20to%20book%20the%20package:%20${encodeURIComponent(
    packageTitle
  )}`;

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8ECF3] p-3 shadow-2xl safe-area-pb transition-transform duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >

      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div>
          <span className="text-[10px] text-[#667085] block uppercase font-bold tracking-wider">Starting at</span>
          <span className="text-lg font-black text-[#3478F6]">{formatPrice(price)}</span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#16A36A] hover:bg-[#128856] text-white px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform min-h-[44px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <Link
            href={`/book-now?packageId=${packageSlug}`}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform min-h-[44px]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

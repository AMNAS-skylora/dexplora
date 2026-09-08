"use client";

import { useEffect, useState } from "react";
import { Send, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { openWhatsAppBooking, WhatsAppDepartureData } from "@/lib/whatsapp";

interface MobileBookingBarProps {
  packageSlug: string;
  packageTitle: string;
  price: number;
  whatsappNumber?: string | null;
  phoneNumber?: string;
  selectedDeparture?: WhatsAppDepartureData | null;
  destinationName?: string;
}

export function MobileBookingBar({
  packageSlug,
  packageTitle,
  price,
  whatsappNumber,
  selectedDeparture,
  destinationName,
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

  const handleBooking = () => {
    openWhatsAppBooking({
      packageData: {
        title: packageTitle,
        slug: packageSlug,
        price,
        destination: destinationName ? { name: destinationName } : undefined,
      },
      selectedDeparture,
      whatsappNumber,
    });
  };

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
          <button
            type="button"
            onClick={handleBooking}
            className="bg-[#16A36A] hover:bg-[#128856] text-white px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform min-h-[44px] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleBooking}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform min-h-[44px] cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}


"use client";

import React from "react";
import { openWhatsAppBooking, WhatsAppPackageData, WhatsAppDepartureData } from "@/lib/whatsapp";

interface PackageBookingButtonProps {
  packageData: WhatsAppPackageData;
  selectedDeparture?: WhatsAppDepartureData | null;
  whatsappNumber?: string | null;
  className?: string;
  children: React.ReactNode;
}

export function PackageBookingButton({
  packageData,
  selectedDeparture,
  whatsappNumber,
  className,
  children,
}: PackageBookingButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        openWhatsAppBooking({
          packageData,
          selectedDeparture,
          whatsappNumber,
        })
      }
      className={className}
    >
      {children}
    </button>
  );
}

export function GeneralBookingButton({
  whatsappNumber,
  className,
  children,
}: {
  whatsappNumber?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        openWhatsAppBooking({
          whatsappNumber,
        })
      }
      className={className}
    >
      {children}
    </button>
  );
}

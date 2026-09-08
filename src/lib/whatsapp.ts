"use client";

import { formatDate, formatPrice } from "@/lib/utils";

export interface WhatsAppPackageData {
  title?: string | null;
  slug?: string | null;
  price?: number | null;
  destination?: { name?: string | null } | string | null;
}

export interface WhatsAppDepartureData {
  id?: string | null;
  batchName?: string | null;
  date?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  price?: number | null;
  priceOverride?: number | null;
  availableSeats?: number | null;
  totalSeats?: number | null;
}

export interface OpenWhatsAppBookingOptions {
  packageData?: WhatsAppPackageData | null;
  selectedDeparture?: WhatsAppDepartureData | null;
  whatsappNumber?: string | null;
  fallbackPhoneNumber?: string | null;
  customPackageLink?: string | null;
}

export function openWhatsAppBooking({
  packageData,
  selectedDeparture,
  whatsappNumber,
  fallbackPhoneNumber,
  customPackageLink,
}: OpenWhatsAppBookingOptions) {
  const rawPhone = whatsappNumber || fallbackPhoneNumber || "";
  const phone = rawPhone.replace(/\D/g, "");

  if (!phone) {
    console.warn("Dexplora WhatsApp number is not configured.");
    return;
  }

  const destinationName =
    typeof packageData?.destination === "string"
      ? packageData.destination
      : packageData?.destination?.name || "";

  let departureStr = "";
  if (selectedDeparture?.date) {
    departureStr = selectedDeparture.date;
  } else if (selectedDeparture?.startDate) {
    const start = formatDate(selectedDeparture.startDate);
    const end = selectedDeparture.endDate ? formatDate(selectedDeparture.endDate) : "";
    departureStr = end ? `${start} — ${end}` : start;
  }

  const batchNameStr = selectedDeparture?.batchName ? ` (${selectedDeparture.batchName})` : "";
  const fullDepartureLine = departureStr ? `Departure: ${departureStr}${batchNameStr}` : null;

  const rawPrice =
    selectedDeparture?.priceOverride ?? selectedDeparture?.price ?? packageData?.price;
  const priceStr =
    rawPrice !== undefined && rawPrice !== null ? `Price: ${formatPrice(rawPrice)}` : null;

  const seatsStr =
    selectedDeparture?.availableSeats !== undefined && selectedDeparture?.availableSeats !== null
      ? `Available Seats: ${selectedDeparture.availableSeats}`
      : null;

  let packageLink = customPackageLink;
  if (!packageLink && typeof window !== "undefined") {
    if (packageData?.slug && !window.location.pathname.includes(packageData.slug)) {
      packageLink = `${window.location.origin}/packages/${packageData.slug}`;
    } else {
      packageLink = window.location.href;
    }
  }

  const details = [
    "Hi Dexplora 👋",
    "",
    "I'm interested in this trip.",
    "",
    packageData?.title ? `Package: ${packageData.title}` : null,
    destinationName ? `Destination: ${destinationName}` : null,
    fullDepartureLine,
    priceStr,
    seatsStr,
    "",
    "Please share the booking details and availability.",
    "",
    packageLink ? `Package Link:\n${packageLink}` : null,
  ].filter((item): item is string => item !== null);

  const message = details.join("\n");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

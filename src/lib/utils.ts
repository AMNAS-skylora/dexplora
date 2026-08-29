import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `DEX-${year}-${randomNum}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeWhatsAppNumber(rawNumber?: string | null): string {
  if (!rawNumber) return "";
  let digits = rawNumber.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) {
    digits = "91" + digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = "91" + digits.slice(1);
  }
  return digits;
}

export function getWhatsAppLink(rawNumber?: string | null, customText?: string): string {
  const normalized = normalizeWhatsAppNumber(rawNumber);
  if (!normalized) return "#";
  const baseUrl = `https://wa.me/${normalized}`;
  if (customText) {
    return `${baseUrl}?text=${encodeURIComponent(customText)}`;
  }
  return baseUrl;
}

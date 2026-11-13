import { db } from "@/lib/db";
import { DEFAULT_CANCELLATION_CHARGES, DEFAULT_CANCELLATION_NOTES, DEFAULT_IMPORTANT_NOTICE } from "@/lib/cancellation-policy";

export interface SiteSettingsMap {
  company_name: string;
  tagline: string;
  phone_1: string;
  phone_2: string;
  whatsapp_number: string;
  email: string;
  address: string;
  google_maps_link: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  seo_title: string;
  seo_description: string;
  footer_text: string;
  booking_auto_cleanup_enabled: string;
  booking_retention_days: string;
  booking_advance_percent: string;
  cancellation_charges: string;
  cancellation_notes: string;
  important_notice: string;
}

export const defaultSettings: SiteSettingsMap = {
  company_name: "Dexplora Tour Planners",
  tagline: "Your Gateway to Unforgettable Group Adventures",
  phone_1: "+91 70342 67985",
  phone_2: "+91 70342 67986",
  whatsapp_number: "917034267985",
  email: "dexploraindia@gmail.com",
  address: "Dexplora Tour Planners, MG Road, Kochi, Kerala 682016",
  google_maps_link: "https://maps.google.com",
  instagram_url: "https://www.instagram.com/dexplora_tourplanners?igsi=czh3MGY5YnpxaDJ3&utm_source=qr",
  facebook_url: "",
  youtube_url: "https://youtube.com/@dexploratours",
  seo_title: "Dexplora Tour Planners | Budget & Group Trips from Kerala",
  seo_description: "Book Malayali guided group tours to Meghalaya, Mahabaleshwar, Matheran, Kashmir & Goa with Dexplora Tour Planners.",
  footer_text: "Dexplora Tour Planners is a premier Kerala-based travel company specializing in budget group departures.",
  booking_auto_cleanup_enabled: "false",
  booking_retention_days: "30",
  booking_advance_percent: "30",
  cancellation_charges: DEFAULT_CANCELLATION_CHARGES,
  cancellation_notes: DEFAULT_CANCELLATION_NOTES,
  important_notice: DEFAULT_IMPORTANT_NOTICE,
};

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  try {
    const settings = await db.siteSetting.findMany();
    const map = { ...defaultSettings };
    for (const s of settings) {
      if (s.key in map) {
        (map as any)[s.key] = s.value;
      }
    }
    return map;
  } catch (error) {
    return defaultSettings;
  }
}

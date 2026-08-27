import { getSiteSettings } from "@/lib/settings";
import { ContactForm } from "@/components/public/ContactForm";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Dexplora Tour Planners",
  description:
    "Get in touch with Dexplora Tour Planners for group trip bookings, itinerary details, and customized travel support.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full min-w-0 max-w-[1180px] mx-auto px-[clamp(14px,4vw,28px)] py-4 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      {/* Page Header Intro */}
      <div className="space-y-1.5 py-1 sm:py-2 text-left sm:text-center max-w-2xl sm:mx-auto">
        <span className="text-[clamp(11px,3vw,13px)] font-bold uppercase tracking-[0.06em] text-[#3478F6] block">
          LET&apos;S PLAN YOUR JOURNEY
        </span>
        <h1 className="text-[clamp(28px,8vw,46px)] font-bold text-[#0B1026] leading-[1.05] tracking-[-0.03em] break-words">
          Get in Touch
        </h1>
        <p className="text-[clamp(14px,3.8vw,17px)] text-[#64748B] leading-[1.5] font-normal mt-1 break-words">
          Have questions about a trip, booking, group departure, or custom travel plan? Our team is here to help.
        </p>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Contact Information & Methods Column (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-[18px] border border-[#E5EAF2] p-4.5 sm:p-6 shadow-[0_4px_14px_rgba(15,23,42,0.035)] space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#0B1026]">Contact Information</h3>

            {/* Responsive 2x2 Mobile / Stacked Desktop Contact Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Call */}
              <a
                href={`tel:${settings.phone_1.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 p-3 rounded-[14px] border border-[#E5EAF2] bg-[#F6F8FC] hover:border-[#3478F6]/40 transition-colors group min-w-0"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center shrink-0 group-hover:bg-[#3478F6] group-hover:text-white transition-colors">
                  <Phone className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block leading-none mb-0.5">Call Us</span>
                  <span className="text-[13px] font-semibold text-[#111827] block truncate">{settings.phone_1}</span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=Hi%20Dexplora%20Tour%20Planners,%20I%20have%20an%20enquiry!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-[14px] border border-[#E5EAF2] bg-[#F6F8FC] hover:border-[#16A36A]/40 transition-colors group min-w-0"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#16A36A]/10 text-[#16A36A] flex items-center justify-center shrink-0 group-hover:bg-[#16A36A] group-hover:text-white transition-colors">
                  <Send className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block leading-none mb-0.5">WhatsApp</span>
                  <span className="text-[13px] font-semibold text-[#16A36A] block truncate">Chat with our team</span>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-3 p-3 rounded-[14px] border border-[#E5EAF2] bg-[#F6F8FC] hover:border-[#3478F6]/40 transition-colors group min-w-0"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center shrink-0 group-hover:bg-[#3478F6] group-hover:text-white transition-colors">
                  <Mail className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block leading-none mb-0.5">Email</span>
                  <span className="text-[13px] font-semibold text-[#111827] block truncate overflow-wrap-anywhere">{settings.email}</span>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 rounded-[14px] border border-[#E5EAF2] bg-[#F6F8FC] min-w-0">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#64748B] block leading-none mb-0.5">Location</span>
                  <span className="text-[12.5px] font-medium text-[#111827] block leading-snug line-clamp-2">{settings.address}</span>
                </div>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="pt-3 border-t border-[#E8EDF4] space-y-2">
              <span className="text-xs font-semibold text-[#64748B] block">Connect With Us</span>
              <div className="flex items-center gap-2.5">
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-[10px] border border-[#E5EAF2] bg-[#F6F8FC] flex items-center justify-center text-[#0B1026] hover:bg-[#3478F6] hover:text-white transition-colors min-w-[40px] min-h-[40px]"
                    aria-label="Instagram"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-[10px] border border-[#E5EAF2] bg-[#F6F8FC] flex items-center justify-center text-[#0B1026] hover:bg-[#3478F6] hover:text-white transition-colors min-w-[40px] min-h-[40px]"
                    aria-label="Facebook"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                    </svg>
                  </a>
                )}
                {settings.whatsapp_number && (
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-[10px] border border-[#E5EAF2] bg-[#F6F8FC] flex items-center justify-center text-[#16A36A] hover:bg-[#16A36A] hover:text-white transition-colors min-w-[40px] min-h-[40px]"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

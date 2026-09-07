import Link from "next/link";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { SiteSettingsMap } from "@/lib/settings";
import { BrandLogo } from "@/components/public/BrandLogo";

interface FooterProps {
  settings: SiteSettingsMap;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-[#050A24] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center shrink-0 min-w-0">
              <BrandLogo variant="footer" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings.footer_text}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3478F6] hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3478F6] hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3478F6] hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Explore Links</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#3478F6] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3478F6] transition-colors">
                  About Dexplora
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-[#3478F6] transition-colors">
                  All Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#3478F6] transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-[#3478F6] transition-colors">
                  Traveler Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Top Destinations</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/packages?destination=meghalaya" className="hover:text-[#3478F6] transition-colors">
                  Meghalaya Group Trip
                </Link>
              </li>
              <li>
                <Link href="/packages?destination=mahabaleshwar" className="hover:text-[#3478F6] transition-colors">
                  Mahabaleshwar Escape
                </Link>
              </li>
              <li>
                <Link href="/packages?destination=matheran" className="hover:text-[#3478F6] transition-colors">
                  Matheran Weekend Tour
                </Link>
              </li>
              <li>
                <Link href="/packages?destination=kashmir" className="hover:text-[#3478F6] transition-colors">
                  Kashmir Special Package
                </Link>
              </li>
              <li>
                <Link href="/packages?destination=goa" className="hover:text-[#3478F6] transition-colors">
                  Goa Beach Vacation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3478F6] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#3478F6] shrink-0" />
                <div className="flex flex-col text-xs">
                  <a href={`tel:${settings.phone_1}`} className="hover:text-white font-medium">
                    {settings.phone_1}
                  </a>
                  <a href={`tel:${settings.phone_2}`} className="hover:text-white font-medium">
                    {settings.phone_2}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#3478F6] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsapp_number}?text=Hi%20Dexplora,%20I%20want%20to%20plan%20a%20trip`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#16A36A] hover:bg-[#128856] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Dexplora Tour Planners. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

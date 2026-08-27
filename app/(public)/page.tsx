import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { HeroSlider } from "@/components/public/HeroSlider";
import { PackageCard } from "@/components/public/PackageCard";
import { DeparturesCalendar } from "@/components/public/DeparturesCalendar";
import { TestimonialSlider } from "@/components/public/TestimonialSlider";
import { DestinationSlider } from "@/components/public/DestinationSlider";
import { Reveal } from "@/components/animation/Reveal";
import { StaggerContainer, StaggerItem } from "@/components/animation/Stagger";
import Link from "next/link";
import Image from "next/image";
import {
  WalletCards,
  UsersRound,
  Compass,
  Headphones,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Hotel,
  Bus,
  Award,
} from "lucide-react";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Budget Group Trips Across India",
  description:
    "Discover budget-friendly group trips, nature escapes and curated travel packages across India with Dexplora Tour Planners.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export default async function HomePage() {
  const settings = await getSiteSettings();

  // Fetch Hero Slides
  const heroSlides = await db.heroSlide.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });

  // Fetch Featured Packages
  const featuredPackages = await db.package.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: {
      destination: true,
      batches: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
    orderBy: { displayOrder: "asc" },
    take: 6,
  });

  // Fetch Upcoming Departure Batches
  const upcomingBatches = await db.tripBatch.findMany({
    where: {
      startDate: { gte: new Date() },
      package: { status: "PUBLISHED" },
    },
    include: {
      package: {
        include: { destination: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Fetch Custom Calendar Events
  const customEvents = await db.calendarEvent.findMany({
    where: { isActive: true },
    include: {
      package: {
        include: { destination: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Fetch Popular Destinations
  const destinations = await db.destination.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
    take: 6,
  });

  // Fetch Gallery Preview
  const galleryPreview = await db.galleryImage.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // Fetch Approved Testimonials
  const testimonials = await db.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const highlights = [
    {
      icon: WalletCards,
      title: "Budget Friendly",
      desc: "All-inclusive trips. No hidden fees.",
    },
    {
      icon: UsersRound,
      title: "Malayali Leaders",
      desc: "Friendly Kerala tour leaders.",
    },
    {
      icon: Compass,
      title: "Curated Trips",
      desc: "Well-planned group itineraries.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Help from booking to return.",
    },
  ];

  const whyChooseUs = [
    {
      icon: WalletCards,
      title: "Budget-Friendly Packages",
      desc: "Pocket-friendly group rates without compromising stay comfort or transport quality.",
    },
    {
      icon: Compass,
      title: "Carefully Planned Itineraries",
      desc: "Designed to cover hidden gems alongside iconic attractions without feeling rushed.",
    },
    {
      icon: UsersRound,
      title: "Unmatched Group Experience",
      desc: "Travel with like-minded explorers, make new friends, and enjoy campfire evenings.",
    },
    {
      icon: Headphones,
      title: "Malayali Guide Support",
      desc: "Our on-ground tour leaders speak Malayalam & local languages for smooth communication.",
    },
    {
      icon: Hotel,
      title: "Comfortable Stays",
      desc: "Handpicked 3-star hotels and nature resorts with hygiene & security standards.",
    },
    {
      icon: Bus,
      title: "Private AC Transfers",
      desc: "Clean, comfortable vehicles for all sightseeing and intercity journeys.",
    },
    {
      icon: ShieldCheck,
      title: "Solo & Family Safe",
      desc: "100% safe environment for solo female travelers, couples, and family groups.",
    },
    {
      icon: Award,
      title: "Transparent Pricing",
      desc: "Clear list of inclusions with no surprise extra charges during the trip.",
    },
  ];

  return (
    <div className="space-y-12 lg:space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="w-full max-w-7xl mx-auto sm:px-6 lg:px-8 sm:pt-6">
        <HeroSlider slides={heroSlides} whatsappNumber={settings.whatsapp_number} />
      </section>

      {/* 2. Refined Highlights Feature Panel */}
      <section className="w-full max-w-7xl mx-auto px-[14px] sm:px-6 lg:px-8">
        <Reveal direction="up" duration={500}>
          <div className="w-full bg-[#F8FAFF] border border-[#DBE6FF] rounded-[18px] p-[14px] sm:p-5 shadow-[0_4px_18px_rgba(15,23,42,0.035)]">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-x-[14px] gap-y-4 sm:gap-x-5 sm:gap-y-6">
              {highlights.map((h, i) => {
                const IconComponent = h.icon;
                return (
                  <StaggerItem key={i} index={i}>
                    <div className="flex items-start gap-[9px] min-w-0">
                      <div className="w-[clamp(32px,8vw,35px)] h-[clamp(32px,8vw,35px)] rounded-[9px] bg-[#3478F6] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <IconComponent className="w-[clamp(15px,4vw,17px)] h-[clamp(15px,4vw,17px)] stroke-[1.8]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-[650] text-[clamp(13px,3.5vw,14px)] text-[#111827] leading-[1.15] tracking-tight break-words whitespace-normal">{h.title}</h4>
                        <p className="text-[clamp(11px,3vw,12px)] text-[#64748B] leading-[1.35] mt-[3px] break-words whitespace-normal">{h.desc}</p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </Reveal>
      </section>

      {/* 3. Featured Packages */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Reveal direction="up" duration={600}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">Handpicked Adventures</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1026] mt-1">
                Featured Tour Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#3478F6] hover:text-[#2563EB] transition-colors"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        {featuredPackages.length > 0 ? (
          <StaggerContainer className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 scrollbar-none">
            {featuredPackages.map((pkg: any, idx: number) => (
              <StaggerItem key={pkg.id} index={idx} className="w-[88%] sm:w-auto shrink-0 snap-align-start">
                <PackageCard {...pkg} featured={pkg.featured} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="bg-[#F3F7FF] rounded-2xl p-12 text-center text-[#667085]">
            <p>No featured packages at the moment. New adventures coming soon!</p>
          </div>
        )}
      </section>

      {/* 4. Dynamic Upcoming Departures Travel Calendar */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Reveal direction="up" duration={650}>
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">
                Upcoming Departures
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1026]">
                Book Your Seat for the Next Trip
              </h2>
              <p className="text-sm text-[#667085]">
                Tap any highlighted calendar date to preview trip details, pricing, and live seat availability.
              </p>
            </div>

            <DeparturesCalendar batches={upcomingBatches} customEvents={customEvents} />
          </div>
        </Reveal>
      </section>


      {/* 5. Popular Destinations */}
      <section className="w-full overflow-hidden py-4">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal direction="up" duration={600}>
            <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">Explore India</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1026]">
                Popular Destinations
              </h2>
              <p className="text-sm text-[#667085]">
                Discover breathtaking mountain ranges, valleys, and coastal escapes.
              </p>
            </div>
          </Reveal>
        </div>

        <DestinationSlider destinations={destinations} />
      </section>



      {/* 7. Gallery Preview */}
      {galleryPreview.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal direction="up" duration={600}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">Visual Stories</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1026] mt-1">
                  Travel Memories Gallery
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#3478F6] hover:text-[#2563EB] transition-colors"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryPreview.map((img: { id: string; url: string; title?: string | null }, idx: number) => (
              <StaggerItem key={img.id} index={idx}>
                <div className="relative aspect-square rounded-2xl overflow-hidden group bg-gray-100 shadow-sm">
                  <Image
                    src={img.url}
                    alt={img.title || "Travel photo"}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {img.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                      <span className="text-white text-xs font-semibold">{img.title}</span>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* 8. Testimonials Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Reveal direction="up" duration={600}>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6]">Real Reviews</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1026]">
              What Our Travelers Say
            </h2>
            <p className="text-sm text-[#667085]">
              Read verified experiences from Malayali travelers who explored India with us.
            </p>
          </div>
          <TestimonialSlider testimonials={testimonials} />
        </Reveal>
      </section>

      {/* 9. CTA Banner */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-6 lg:px-8">
        <Reveal direction="up" duration={650}>
          <div className="bg-gradient-to-r from-[#3478F6] to-[#2563EB] text-white rounded-none md:rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Ready for Your Next Journey?
              </h2>
              <p className="text-base sm:text-lg text-blue-100 font-medium">
                Plan your group trip, corporate retreat, or family vacation with Dexplora Tour Planners today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/book-now"
                  className="bg-white text-[#3478F6] hover:bg-gray-100 px-8 py-3.5 rounded-xl font-extrabold text-base shadow-lg transition-all active:scale-95 min-h-[48px] flex items-center justify-center"
                >
                  Book Your Trip Now
                </Link>
                <a
                  href={`https://wa.me/${settings.whatsapp_number}?text=Hi%20Dexplora,%20I%20want%20to%20plan%20a%20trip`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/20 hover:bg-black/30 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 min-h-[48px] flex items-center justify-center"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}



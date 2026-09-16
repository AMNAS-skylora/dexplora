import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { HeroSlider } from "@/components/public/HeroSlider";
import { PackageCard } from "@/components/public/PackageCard";
import { PackagesSlider } from "@/components/public/PackagesSlider";
import { TestimonialSlider } from "@/components/public/TestimonialSlider";
import { DestinationSlider } from "@/components/public/DestinationSlider";
import { InstagramSlider } from "@/components/public/InstagramSlider";
import { GeneralBookingButton } from "@/components/public/PackageBookingCTA";
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

export const dynamic = "force-dynamic";

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

  // Safely fetch home page data with try-catch fallbacks
  let heroSlides: any[] = [];
  let featuredPackages: any[] = [];
  let upcomingBatches: any[] = [];
  let customEvents: any[] = [];
  let destinations: any[] = [];
  let galleryPreview: any[] = [];
  let testimonials: any[] = [];
  let instagramPosts: any[] = [];

  try {
    instagramPosts = await db.instagramPost.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Auto-trigger background thumbnail refresh if any active post is missing Cloudinary thumbnail
    if (instagramPosts.some((p: any) => !p.cloudinary_thumbnail_url && !p.cloudinaryThumbnailUrl)) {
      import("@/actions").then((actions) => actions.refreshAllInstagramThumbnails()).catch(() => {});
    }
  } catch (error) {
    console.error("Error fetching instagramPosts:", error);
  }

  try {
    const now = new Date();
    const rawHeroSlides = await db.heroSlide.findMany({
      where: {
        OR: [
          { isActive: true },
          { active: true },
        ],
      },
      include: {
        event: {
          include: {
            package: {
              include: { destination: true },
            },
          },
        },
      },
      orderBy: [
        { sortOrder: "asc" },
        { displayOrder: "asc" },
      ],
    });

    heroSlides = (rawHeroSlides || []).filter((slide: any) => {
      const type = slide.type || "CUSTOM";
      if (type === "SCHEDULED_OFFER") {
        if (!slide.startDate || !slide.endDate) return false;
        const start = new Date(slide.startDate);
        const end = new Date(slide.endDate);
        if (now < start || now >= end) return false;
      }
      return true;
    });
  } catch (error) {
    console.error("Error fetching heroSlides:", error);
  }

  let allPackages: any[] = [];
  try {
    allPackages = await db.package.findMany({
      where: { status: "PUBLISHED" },
      include: {
        destination: true,
        batches: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
          take: 1,
        },
      },
      orderBy: { displayOrder: "asc" },
    });
  } catch (error) {
    console.error("Error fetching allPackages:", error);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const rawBatches = await db.tripBatch.findMany({
      where: {
        startDate: { gte: today },
      },
      include: {
        package: {
          include: { destination: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    upcomingBatches = (rawBatches || []).filter(
      (b: any) =>
        b.status !== "CANCELLED" &&
        b.status !== "COMPLETED" &&
        (!b.package || b.package.status === "PUBLISHED" || b.package.status === undefined)
    );
  } catch (error) {
    console.error("Error fetching upcomingBatches:", error);
  }

  try {
    customEvents = await db.calendarEvent.findMany({
      where: { isActive: true },
      include: {
        package: {
          include: { destination: true },
        },
      },
      orderBy: { startDate: "asc" },
    });
  } catch (error) {
    console.error("Error fetching customEvents:", error);
  }

  try {
    destinations = await db.destination.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
  }

  try {
    galleryPreview = await db.galleryImage.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  } catch (error) {
    console.error("Error fetching galleryPreview:", error);
  }

  try {
    testimonials = await db.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }

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

      {/* 3. Tour Packages Horizontal Drag/Swipe Slider */}
      <section className="w-full py-10 lg:py-18 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-[clamp(16px,4vw,24px)]">
          <Reveal direction="up" duration={600}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <span className="text-[13px] font-semibold tracking-[0.04em] text-[#3478F6] uppercase block">
                  Handpicked Adventures
                </span>
                <h2 className="text-[clamp(28px,5vw,44px)] leading-[1.05] font-extrabold text-[#0B1026] mt-1 tracking-tight">
                  Tour Packages
                </h2>
              </div>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3478F6] hover:text-[#2563EB] transition-colors shrink-0"
              >
                <span>View All Packages</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </Link>
            </div>
          </Reveal>

          {allPackages.length > 0 ? (
            <PackagesSlider packages={allPackages} />
          ) : (
            <div className="bg-[#F3F7FF] rounded-2xl p-12 text-center text-[#667085]">
              <p>No tour packages available at the moment. New adventures coming soon!</p>
            </div>
          )}
        </div>
      </section>


      {/* 5. Popular Destinations */}
      <section className="w-full overflow-hidden py-10 sm:py-16 md:py-20 bg-gradient-to-b from-[#F3F7FF]/90 via-white to-[#F8FAFC] border-y border-[#E8ECF3]/60 relative">
        {/* Subtle Ambient Travel Backdrop Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#3478F6]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Reveal direction="up" duration={600}>
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#3478F6] bg-[#3478F6]/10 border border-[#3478F6]/20 px-3.5 py-1 rounded-full inline-block">
                Explore India
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1026] tracking-tight">
                Popular Destinations
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#667085] font-medium max-w-lg mx-auto">
                Discover breathtaking mountain ranges, lush valleys, and coastal escapes curated for your next journey.
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

      {/* 9. Instagram Post Slider Section */}
      {instagramPosts.length > 0 && (
        <InstagramSlider posts={instagramPosts} />
      )}

      {/* 10. CTA Banner */}
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
                <GeneralBookingButton
                  whatsappNumber={settings.whatsapp_number}
                  className="bg-white text-[#3478F6] hover:bg-gray-100 px-8 py-3.5 rounded-xl font-extrabold text-base shadow-lg transition-all active:scale-95 min-h-[48px] flex items-center justify-center cursor-pointer"
                >
                  Book Your Trip Now
                </GeneralBookingButton>
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



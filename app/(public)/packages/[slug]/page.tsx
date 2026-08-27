import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { formatPrice, formatDate } from "@/lib/utils";
import { MobileBookingBar } from "@/components/public/MobileBookingBar";
import { PackageCard } from "@/components/public/PackageCard";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CalendarDays,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bus,
  Hotel,
  Utensils,
  ShieldCheck,
  Phone,
  Send,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

interface PackageDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let pkg: any = null;

  try {
    pkg = await db.package.findUnique({
      where: { slug },
      select: {
        title: true,
        shortDescription: true,
        coverImage: true,
        destination: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error("Error fetching package metadata:", error);
  }

  if (!pkg) {
    return {
      title: "Package Not Found",
      robots: { index: false, follow: false },
    };
  }

  const packageUrl = absoluteUrl(`/packages/${slug}`);
  const title = `${pkg.title} | Dexplora Tour Planners`;
  const description =
    pkg.shortDescription ||
    `Book ${pkg.title} with Dexplora Tour Planners. Includes stays, Malayali tour leaders, and sightseeing in ${pkg.destination?.name || "India"}.`;

  const imageUrl = pkg.coverImage?.startsWith("http")
    ? pkg.coverImage
    : absoluteUrl(pkg.coverImage || "/images/logo/logoblack.png");

  return {
    title: pkg.title,
    description,
    alternates: {
      canonical: packageUrl,
    },
    openGraph: {
      title,
      description,
      url: packageUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: pkg.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings();

  let pkg: any = null;
  try {
    pkg = await db.package.findUnique({
      where: { slug },
      include: {
        destination: true,
        images: { orderBy: { displayOrder: "asc" } },
        itineraries: { orderBy: { dayNumber: "asc" } },
        inclusions: { orderBy: { displayOrder: "asc" } },
        exclusions: { orderBy: { displayOrder: "asc" } },
        faqs: { orderBy: { displayOrder: "asc" } },
        batches: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching package detail:", error);
  }

  if (!pkg || pkg.status === "DRAFT" || pkg.status === "HIDDEN") {
    notFound();
  }

  // Fetch related packages (same destination or general featured)
  const relatedPackages = await db.package.findMany({
    where: {
      id: { not: pkg.id },
      status: "PUBLISHED",
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      batches: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
  });

  const nextBatch = pkg.batches.length > 0 ? pkg.batches[0] : null;
  const cleanWhatsapp = settings.whatsapp_number.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=Hi%20Dexplora,%20I%20want%20information%20about%20the%20${encodeURIComponent(
    pkg.title
  )}%20trip`;

  const packageUrl = absoluteUrl(`/packages/${pkg.slug}`);
  const imageUrl = pkg.coverImage.startsWith("http") ? pkg.coverImage : absoluteUrl(pkg.coverImage);

  const touristTripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": pkg.title,
    "description": pkg.shortDescription || pkg.fullDescription,
    "image": imageUrl,
    "url": packageUrl,
    "touristType": [pkg.tripType || "Group Departure"],
    "offers": {
      "@type": "Offer",
      "price": pkg.price.toString(),
      "priceCurrency": "INR",
      "availability": nextBatch && nextBatch.availableSeats > 0 ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      "url": packageUrl,
    },
    "itinerary": pkg.itineraries.map((it: { dayNumber: number; title: string; description: string }) => ({
      "@type": "ItemList",
      "name": `Day ${it.dayNumber}: ${it.title}`,
      "description": it.description,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Packages",
        "item": absoluteUrl("/packages"),
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pkg.title,
        "item": packageUrl,
      },
    ],
  };

  return (
    <div className="w-full min-w-0 max-w-[1180px] mx-auto px-[clamp(14px,4vw,28px)] py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-12">
      <JsonLd data={touristTripSchema} />
      <JsonLd data={breadcrumbSchema} />
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium overflow-x-auto no-scrollbar py-0.5 min-w-0">
        <Link href="/" className="hover:text-[#3478F6] shrink-0 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
        <Link href="/packages" className="hover:text-[#3478F6] shrink-0 transition-colors">
          Packages
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
        <span className="text-[#3478F6] font-semibold truncate shrink-0">{pkg.destination.name}</span>
      </nav>

      {/* 2. Main 2-Column Responsive Layout (Mobile Stack / Desktop 2-Column with Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Package Content Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* Hero Image Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] rounded-[18px] overflow-hidden bg-gray-100 border border-[#E5EAF2] shadow-xs">
            <Image
              src={pkg.coverImage}
              alt={pkg.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 800px"
              className="object-cover object-center"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050A24]/70 via-transparent to-transparent pointer-events-none" />

            {/* Badges on Hero */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
              <span className="px-3 py-1 bg-[#3478F6] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                {pkg.tripType || "GROUP DEPARTURE"}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold rounded-full border border-white/30 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white" />
                {pkg.destination.name}
              </span>
            </div>
          </div>

          {/* Title & Introductory Section */}
          <div className="space-y-3 min-w-0">
            <h1 className="text-[clamp(26px,7vw,42px)] font-bold text-[#0B1026] leading-[1.06] tracking-[-0.025em] break-words">
              {pkg.title}
            </h1>

            {pkg.shortDescription && (
              <p className="text-[clamp(14px,3.7vw,17px)] text-[#64748B] leading-[1.5] font-normal break-words">
                {pkg.shortDescription}
              </p>
            )}

            {/* Meta Chips Row */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F8FC] border border-[#E5EAF2] text-xs font-semibold text-[#0B1026]">
                <MapPin className="w-3.5 h-3.5 text-[#3478F6]" />
                <span>{pkg.destination.name}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F8FC] border border-[#E5EAF2] text-xs font-semibold text-[#0B1026]">
                <Clock className="w-3.5 h-3.5 text-[#3478F6]" />
                <span>{pkg.duration}</span>
              </div>
              {pkg.departureLocation && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F8FC] border border-[#E5EAF2] text-xs font-semibold text-[#0B1026]">
                  <Bus className="w-3.5 h-3.5 text-[#3478F6]" />
                  <span>Pickup: {pkg.departureLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Booking Card (Visible prominently on mobile top stack) */}
          <div className="bg-[#F8FAFF] rounded-[18px] border border-[#DBE6FF] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">Starting From</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-[clamp(27px,7vw,36px)] font-bold text-[#3478F6] leading-none">
                    {formatPrice(pkg.price)}
                  </span>
                  {pkg.originalPrice && (
                    <span className="text-xs text-[#94A3B8] line-through font-medium">
                      {formatPrice(pkg.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#64748B]">per person</span>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">Availability</span>
                {nextBatch ? (
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    nextBatch.availableSeats <= 5 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-[#16A36A] border border-emerald-200"
                  }`}>
                    {nextBatch.availableSeats} seats left
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    Open Booking
                  </span>
                )}
              </div>
            </div>

            {nextBatch && (
              <div className="pt-3 border-t border-[#E5EAF2]/80 flex items-center justify-between text-xs font-medium text-[#334155]">
                <span className="text-[#64748B]">Next Departure:</span>
                <span className="font-bold text-[#0B1026] flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#3478F6]" />
                  {formatDate(nextBatch.startDate)}
                </span>
              </div>
            )}

            <div className="pt-1">
              <Link
                href={`/book-now?packageId=${pkg.slug}${nextBatch ? `&batchId=${nextBatch.id}` : ""}`}
                className="w-full h-[50px] bg-[#3478F6] hover:bg-[#2563EB] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Seats Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Features Bar */}
          <div className="bg-white rounded-[16px] border border-[#E5EAF2] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shadow-xs">
            <div className="space-y-0.5">
              <Clock className="w-4 h-4 text-[#3478F6] mx-auto" />
              <span className="text-[11px] font-semibold text-[#64748B] block">Duration</span>
              <span className="text-xs font-bold text-[#0B1026] block truncate">{pkg.duration}</span>
            </div>
            <div className="space-y-0.5">
              <Hotel className="w-4 h-4 text-[#3478F6] mx-auto" />
              <span className="text-[11px] font-semibold text-[#64748B] block">Stay</span>
              <span className="text-xs font-bold text-[#0B1026] block truncate">{pkg.accommodation || "3★ Stays"}</span>
            </div>
            <div className="space-y-0.5">
              <Utensils className="w-4 h-4 text-[#3478F6] mx-auto" />
              <span className="text-[11px] font-semibold text-[#64748B] block">Meals</span>
              <span className="text-xs font-bold text-[#0B1026] block truncate">{pkg.meals || "Included"}</span>
            </div>
            <div className="space-y-0.5">
              <Users className="w-4 h-4 text-[#3478F6] mx-auto" />
              <span className="text-[11px] font-semibold text-[#64748B] block">Leader</span>
              <span className="text-xs font-bold text-[#0B1026] block truncate">{pkg.guideInfo || "Malayali Guide"}</span>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[clamp(20px,5vw,27px)] font-bold text-[#0B1026] leading-tight">
              Trip Overview
            </h2>
            <p className="text-[clamp(14px,3.6vw,16px)] text-[#64748B] leading-[1.6] whitespace-pre-line break-words">
              {pkg.fullDescription}
            </p>
          </div>

          {/* Day-by-Day Detailed Itinerary */}
          {pkg.itineraries.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[clamp(20px,5vw,27px)] font-bold text-[#0B1026] leading-tight">
                  Detailed Itinerary
                </h2>
                <span className="text-xs text-[#3478F6] font-bold bg-[#3478F6]/10 px-2.5 py-1 rounded-full">
                  {pkg.itineraries.length} Days Schedule
                </span>
              </div>

              <div className="space-y-3">
                {pkg.itineraries.map((it: { id: string; dayNumber: number; title: string; description: string; meals?: string | null; accommodation?: string | null }) => (
                  <div
                    key={it.id}
                    className="bg-white rounded-[16px] border border-[#E5EAF2] p-4.5 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#3478F6] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        Day {it.dayNumber}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#0B1026]">{it.title}</h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed sm:pl-11 break-words">
                      {it.description}
                    </p>

                    {(it.meals || it.accommodation) && (
                      <div className="sm:pl-11 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0B1026]">
                        {it.meals && (
                          <span className="bg-[#F3F7FF] text-[#3478F6] px-2.5 py-1 rounded-md">
                            Meals: {it.meals}
                          </span>
                        )}
                        {it.accommodation && (
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                            Stay: {it.accommodation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Inclusions */}
            {pkg.inclusions.length > 0 && (
              <div className="bg-[#F0FDF4] rounded-[16px] p-4.5 border border-[#DCFCE7] space-y-3">
                <div className="flex items-center gap-2 text-[#16A36A]">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 stroke-[2.5]" />
                  <h3 className="font-bold text-sm sm:text-base">What&apos;s Included</h3>
                </div>
                <ul className="space-y-2 text-xs text-[#1E293B] font-medium">
                  {pkg.inclusions.map((inc: { id: string; text: string }) => (
                    <li key={inc.id} className="flex items-start gap-2">
                      <span className="text-[#16A36A] font-bold">✓</span>
                      <span className="break-words">{inc.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions */}
            {pkg.exclusions.length > 0 && (
              <div className="bg-[#FEF2F2] rounded-[16px] p-4.5 border border-[#FEE2E2] space-y-3">
                <div className="flex items-center gap-2 text-[#DC2626]">
                  <XCircle className="w-4.5 h-4.5 shrink-0 stroke-[2.5]" />
                  <h3 className="font-bold text-sm sm:text-base">What&apos;s Not Included</h3>
                </div>
                <ul className="space-y-2 text-xs text-[#1E293B] font-medium">
                  {pkg.exclusions.map((exc: { id: string; text: string }) => (
                    <li key={exc.id} className="flex items-start gap-2">
                      <span className="text-[#DC2626] font-bold">✕</span>
                      <span className="break-words">{exc.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Boarding Points */}
          {pkg.departureLocation && (
            <div className="bg-white rounded-[16px] border border-[#E5EAF2] p-4.5 shadow-xs space-y-2.5">
              <h3 className="font-bold text-sm sm:text-base text-[#0B1026] flex items-center gap-2">
                <Bus className="w-4.5 h-4.5 text-[#3478F6]" />
                <span>Pickup & Boarding Points</span>
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Boarding assistance and pickup details for this group departure:
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#F6F8FC] border border-[#E5EAF2] rounded-xl text-xs font-semibold text-[#0B1026]">
                <MapPin className="w-3.5 h-3.5 text-[#3478F6]" />
                <span>{pkg.departureLocation}</span>
              </div>
            </div>
          )}

          {/* Upcoming Departure Dates Grid */}
          {pkg.batches.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-[clamp(20px,5vw,27px)] font-bold text-[#0B1026] leading-tight">
                Upcoming Departure Dates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.batches.map((b: { id: string; batchName?: string | null; startDate: Date | string; endDate: Date | string; availableSeats: number; priceOverride?: number | null }) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-[16px] border border-[#E5EAF2] p-4 flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#3478F6] uppercase tracking-wider block">
                        {b.batchName || "Group Batch"}
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-[#0B1026]">
                        {formatDate(b.startDate)} — {formatDate(b.endDate)}
                      </div>
                      <span className="text-xs text-[#64748B] block">
                        {b.availableSeats} seats remaining
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
                      <span className="text-sm font-bold text-[#3478F6]">
                        {formatPrice(b.priceOverride || pkg.price)}
                      </span>
                      <Link
                        href={`/book-now?packageId=${pkg.slug}&batchId=${b.id}`}
                        className="bg-[#3478F6] hover:bg-[#2563EB] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                      >
                        Book Batch
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Gallery Photos */}
          {pkg.images.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-[clamp(20px,5vw,27px)] font-bold text-[#0B1026] leading-tight">
                Trip Photos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {pkg.images.map((img: { id: string; url: string; caption?: string | null }) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-[14px] overflow-hidden bg-gray-100 border border-[#E5EAF2] shadow-xs"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || pkg.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {pkg.faqs.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#E8ECF3]">
              <h2 className="text-[clamp(20px,5vw,27px)] font-bold text-[#0B1026] leading-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-2.5">
                {pkg.faqs.map((faq: { id: string; question: string; answer: string }) => (
                  <div key={faq.id} className="bg-[#F8FAFC] rounded-[14px] p-4 border border-[#E5EAF2] space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1026] flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs text-[#64748B] pl-6 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Desktop Sticky Booking Column (lg:col-span-4) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-[84px] bg-white rounded-[20px] border border-[#E5EAF2] p-6 shadow-[0_6px_20px_rgba(15,23,42,0.04)] space-y-5">
            <div>
              <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">Package Price</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#3478F6]">{formatPrice(pkg.price)}</span>
                {pkg.originalPrice && (
                  <span className="text-sm text-[#94A3B8] line-through font-medium">
                    {formatPrice(pkg.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#64748B] font-semibold">/ person</span>
              </div>
            </div>

            {nextBatch && (
              <div className="bg-[#F8FAFF] rounded-xl p-3 border border-[#DBE6FF] space-y-1 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3478F6] block">Next Departure</span>
                <div className="font-bold text-[#0B1026] text-sm">
                  {formatDate(nextBatch.startDate)}
                </div>
                <span className="text-[#64748B] text-[11px] font-semibold block">
                  {nextBatch.availableSeats} seats remaining
                </span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Link
                href={`/book-now?packageId=${pkg.slug}${nextBatch ? `&batchId=${nextBatch.id}` : ""}`}
                className="w-full h-[48px] bg-[#3478F6] hover:bg-[#2563EB] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book This Package</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[44px] bg-[#16A36A] hover:bg-[#128856] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enquire on WhatsApp</span>
              </a>

              <a
                href={`tel:${settings.phone_1.replace(/\s+/g, "")}`}
                className="w-full h-[42px] bg-[#F6F8FC] border border-[#E5EAF2] text-[#0B1026] hover:bg-gray-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#3478F6]" />
                <span>Call {settings.phone_1}</span>
              </a>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] space-y-2 text-xs text-[#64748B]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Malayali Tour Leader Included</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Transparent Booking & Prices</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Instant Confirmation Assistance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Packages Section */}
      {relatedPackages.length > 0 && (
        <section className="pt-8 sm:pt-12 border-t border-[#E8ECF3] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[clamp(20px,5vw,28px)] font-bold text-[#0B1026] leading-tight">
              You May Also Like
            </h2>
            <Link
              href="/packages"
              className="text-xs font-bold text-[#3478F6] hover:underline flex items-center gap-1"
            >
              <span>View All Packages</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {relatedPackages.map((rp) => (
              <PackageCard
                key={rp.id}
                id={rp.id}
                title={rp.title}
                slug={rp.slug}
                shortDescription={rp.shortDescription}
                coverImage={rp.coverImage}
                duration={rp.duration}
                price={rp.price}
                originalPrice={rp.originalPrice}
                departureLocation={rp.departureLocation}
                tripType={rp.tripType}
                destination={rp.destination}
                batches={rp.batches}
                featured={rp.featured}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Booking Bar */}
      <MobileBookingBar
        packageSlug={pkg.slug}
        packageTitle={pkg.title}
        price={pkg.price}
        whatsappNumber={settings.whatsapp_number}
        phoneNumber={settings.phone_1}
      />
    </div>
  );
}

"use server";

import { db } from "@/lib/db";
import { setAdminSessionCookie, clearAdminSessionCookie, getAdminSession } from "@/lib/auth";
import { generateBookingRef, slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";
export type PackageStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "SOLD_OUT" | "ARCHIVED";
export type BatchStatus = "UPCOMING" | "OPEN" | "FILLING_FAST" | "ALMOST_FULL" | "SOLD_OUT" | "COMPLETED" | "CANCELLED";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
export type BookingStatus = "NEW" | "READ" | "CONTACTED" | "CONFIRMED" | "CANCELLED";
export type ContactStatus = "NEW" | "READ" | "REPLIED" | "RESOLVED" | "SPAM";


// ================= AUTH ACTIONS =================
export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  await setAdminSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AdminRole,
  });


  return { success: true };
}

export async function logoutAdmin() {
  await clearAdminSessionCookie();
  revalidatePath("/");
  return { success: true };
}

// ================= BOOKING ACTIONS =================
export async function createBookingEnquiry(data: {
  fullName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  packageId: string;
  batchId?: string;
  numberOfTravellers: number;
  adults: number;
  children: number;
  preferredDate?: string;
  boardingLocation?: string;
  message?: string;
}) {
  try {
    const referenceCode = generateBookingRef();
    const booking = await db.bookingEnquiry.create({
      data: {
        referenceCode,
        fullName: data.fullName,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber || data.phone,
        email: data.email || null,
        packageId: data.packageId,
        batchId: data.batchId || null,
        numberOfTravellers: Number(data.numberOfTravellers) || 1,
        adults: Number(data.adults) || 1,
        children: Number(data.children) || 0,
        preferredDate: data.preferredDate || null,
        boardingLocation: data.boardingLocation || null,
        message: data.message || null,
        status: "NEW",
      },
      include: {
        package: true,
        batch: true,
      },
    });

    revalidatePath("/admin/bookings");
    return { success: true, booking };
  } catch (error) {
    console.error("Create package error:", error);
    return { error: "Failed to create package." };
  }

}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.bookingEnquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function deleteBooking(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.bookingEnquiry.delete({ where: { id } });
  revalidatePath("/admin/bookings");
  return { success: true };
}

// ================= CONTACT ACTIONS =================
export async function createContactEnquiry(data: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}) {
  try {
    const enquiry = await db.contactEnquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        subject: data.subject || null,
        message: data.message,
        status: "NEW",
      },
    });
    revalidatePath("/admin/enquiries");
    return { success: true, enquiry };
  } catch (error) {
    return { error: "Failed to submit message. Please try again." };
  }
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.contactEnquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/enquiries");
  return { success: true };
}

export async function deleteContact(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.contactEnquiry.delete({ where: { id } });
  revalidatePath("/admin/enquiries");
  return { success: true };
}

// ================= REVIEW / TESTIMONIAL ACTIONS =================
export async function submitPublicReview(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  tripName: string;
  rating: number;
  review: string;
  travelDate?: string;
  customerPhoto?: string;
}) {
  try {
    const testimonial = await db.testimonial.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || null,
        tripName: data.tripName,
        rating: Number(data.rating) || 5,
        review: data.review,
        travelDate: data.travelDate || null,
        customerPhoto: data.customerPhoto || null,
        status: "PENDING", // MUST BE PENDING UNTIL ADMIN APPROVES
        featured: false,
      },
    });

    revalidatePath("/reviews");
    revalidatePath("/admin/testimonials");
    return { success: true, testimonial };
  } catch (error) {
    return { error: "Failed to submit review. Please try again." };
  }
}

export async function updateReviewStatus(id: string, status: ReviewStatus, featured?: boolean) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.testimonial.update({
    where: { id },
    data: {
      status,
      ...(featured !== undefined ? { featured } : {}),
    },
  });
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function deleteReview(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export interface PackageInputData {
  title: string;
  slug?: string;
  shortDescription: string;
  fullDescription: string;
  destinationId: string;
  tripType?: string;
  coverImage: string;
  duration: string;
  price: number;
  originalPrice?: number | null;
  departureLocation: string;
  arrivalLocation: string;
  accommodation: string;
  transportation: string;
  guideInfo: string;
  meals: string;
  featured?: boolean;
  popular?: boolean;
  status: PackageStatus;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  images?: Array<{ url: string; caption?: string }>;
  itineraries?: Array<{ dayNumber?: number; title: string; description: string; image?: string; meals?: string; accommodation?: string }>;
  inclusions?: Array<string | { text: string }>;
  exclusions?: Array<string | { text: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

export interface TripBatchInputData {
  packageId: string;
  batchName?: string;
  startDate: string | Date;
  endDate: string | Date;
  priceOverride?: number | null;
  totalSeats?: number;
  bookedSeats?: number;
  status: BatchStatus;
  boardingPoint?: string;
  notes?: string;
}

export interface HeroSlideInputData {
  title: string;
  subtitle?: string;
  badge?: string;
  destination?: string;
  startingPrice?: number | null;
  desktopImage: string;
  mobileImage?: string;
  primaryBtnText?: string;
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface DestinationInputData {
  name: string;
  slug?: string;
  state: string;
  country?: string;
  shortDescription?: string;
  coverImage?: string;
  featured?: boolean;
  active?: boolean;
  displayOrder?: number;
}

export interface GalleryImageInputData {
  title?: string;
  caption?: string;
  url: string;
  category?: string;
  destinationId?: string;
  albumId?: string;
  featured?: boolean;
  published?: boolean;
  displayOrder?: number;
}

// ================= PACKAGE ACTIONS =================
export async function createPackage(data: PackageInputData) {

  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const packageSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    const existing = await db.package.findUnique({ where: { slug: packageSlug } });
    if (existing) {
      return { error: "A package with this URL slug already exists." };
    }

    const newPkg = await db.package.create({
      data: {
        title: data.title,
        slug: packageSlug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        destinationId: data.destinationId,
        tripType: data.tripType || "Group Trip",
        coverImage: data.coverImage,
        duration: data.duration,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        departureLocation: data.departureLocation,
        arrivalLocation: data.arrivalLocation,
        accommodation: data.accommodation,
        transportation: data.transportation,
        guideInfo: data.guideInfo,
        meals: data.meals,
        featured: Boolean(data.featured),
        popular: Boolean(data.popular),
        status: data.status as PackageStatus,
        displayOrder: Number(data.displayOrder) || 0,
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.shortDescription,
        images: {
          create: (data.images || []).map((img: any, idx: number) => ({
            url: img.url,
            caption: img.caption || null,
            displayOrder: idx,
          })),
        },
        itineraries: {
          create: (data.itineraries || []).map((it: any, idx: number) => ({
            dayNumber: Number(it.dayNumber) || idx + 1,
            title: it.title,
            description: it.description,
            image: it.image || null,
            meals: it.meals || null,
            accommodation: it.accommodation || null,
            displayOrder: idx,
          })),
        },
        inclusions: {
          create: (data.inclusions || []).map((inc: any, idx: number) => ({
            text: typeof inc === "string" ? inc : inc.text,
            displayOrder: idx,
          })),
        },
        exclusions: {
          create: (data.exclusions || []).map((exc: any, idx: number) => ({
            text: typeof exc === "string" ? exc : exc.text,
            displayOrder: idx,
          })),
        },
        faqs: {
          create: (data.faqs || []).map((faq: any, idx: number) => ({
            question: faq.question,
            answer: faq.answer,
            displayOrder: idx,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    return { success: true, package: newPkg };
  } catch (error: any) {
    console.error("Create package error:", error);
    return { error: "Failed to create package." };
  }
}

export async function updatePackage(id: string, data: PackageInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const packageSlug = data.slug ? slugify(data.slug) : slugify(data.title);

    // Clear old relations to replace with new ones
    await db.packageItinerary.deleteMany({ where: { packageId: id } });
    await db.packageInclusion.deleteMany({ where: { packageId: id } });
    await db.packageExclusion.deleteMany({ where: { packageId: id } });
    await db.packageFAQ.deleteMany({ where: { packageId: id } });
    await db.packageImage.deleteMany({ where: { packageId: id } });

    const updatedPkg = await db.package.update({
      where: { id },
      data: {
        title: data.title,
        slug: packageSlug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        destinationId: data.destinationId,
        tripType: data.tripType || "Group Trip",
        coverImage: data.coverImage,
        duration: data.duration,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        departureLocation: data.departureLocation,
        arrivalLocation: data.arrivalLocation,
        accommodation: data.accommodation,
        transportation: data.transportation,
        guideInfo: data.guideInfo,
        meals: data.meals,
        featured: Boolean(data.featured),
        popular: Boolean(data.popular),
        status: data.status as PackageStatus,
        displayOrder: Number(data.displayOrder) || 0,
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.shortDescription,
        images: {
          create: (data.images || []).map((img, idx: number) => ({
            url: img.url,
            caption: img.caption || null,
            displayOrder: idx,
          })),
        },
        itineraries: {
          create: (data.itineraries || []).map((it, idx: number) => ({
            dayNumber: Number(it.dayNumber) || idx + 1,
            title: it.title,
            description: it.description,
            image: it.image || null,
            meals: it.meals || null,
            accommodation: it.accommodation || null,
            displayOrder: idx,
          })),
        },
        inclusions: {
          create: (data.inclusions || []).map((inc, idx: number) => ({
            text: typeof inc === "string" ? inc : inc.text,
            displayOrder: idx,
          })),
        },
        exclusions: {
          create: (data.exclusions || []).map((exc, idx: number) => ({
            text: typeof exc === "string" ? exc : exc.text,
            displayOrder: idx,
          })),
        },
        faqs: {
          create: (data.faqs || []).map((faq, idx: number) => ({
            question: faq.question,
            answer: faq.answer,
            displayOrder: idx,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath(`/packages/${packageSlug}`);
    revalidatePath("/admin/packages");
    return { success: true, package: updatedPkg };
  } catch (error) {
    console.error("Update package error:", error);
    return { error: "Failed to update package." };
  }
}

export async function deletePackage(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.package.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { success: true };
}

// ================= BATCH ACTIONS =================
export async function createTripBatch(data: TripBatchInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const totalSeats = Number(data.totalSeats) || 30;
    const bookedSeats = Number(data.bookedSeats) || 0;
    const availableSeats = Math.max(0, totalSeats - bookedSeats);

    const batch = await db.tripBatch.create({
      data: {
        packageId: data.packageId,
        batchName: data.batchName || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        priceOverride: data.priceOverride ? Number(data.priceOverride) : null,
        totalSeats,
        bookedSeats,
        availableSeats,
        status: data.status as BatchStatus,
        boardingPoint: data.boardingPoint || null,
        notes: data.notes || null,
      },
    });

    revalidatePath("/upcoming-trips");
    revalidatePath("/admin/upcoming-trips");
    return { success: true, batch };
  } catch (error) {
    return { error: "Failed to create batch." };
  }
}

export async function deleteTripBatch(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.tripBatch.delete({ where: { id } });
  revalidatePath("/upcoming-trips");
  revalidatePath("/admin/upcoming-trips");
  return { success: true };
}

// ================= HERO SLIDE ACTIONS =================
export async function createHeroSlide(data: HeroSlideInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const slide = await db.heroSlide.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      badge: data.badge || null,
      destination: data.destination || null,
      startingPrice: data.startingPrice ? Number(data.startingPrice) : null,
      desktopImage: data.desktopImage,
      mobileImage: data.mobileImage || null,
      primaryBtnText: data.primaryBtnText || "Explore Package",
      primaryBtnUrl: data.primaryBtnUrl || "/packages",
      secondaryBtnText: data.secondaryBtnText || null,
      secondaryBtnUrl: data.secondaryBtnUrl || null,
      displayOrder: Number(data.displayOrder) || 0,
      active: Boolean(data.active),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
  return { success: true, slide };
}

export async function deleteHeroSlide(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
  return { success: true };
}

// ================= DESTINATION ACTIONS =================
export async function createDestination(data: DestinationInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const destSlug = data.slug ? slugify(data.slug) : slugify(data.name);
  const dest = await db.destination.create({
    data: {
      name: data.name,
      slug: destSlug,
      state: data.state,
      country: data.country || "India",
      shortDescription: data.shortDescription || null,
      coverImage: data.coverImage || null,
      featured: Boolean(data.featured),
      active: Boolean(data.active),
      displayOrder: Number(data.displayOrder) || 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/packages");
  revalidatePath("/admin/destinations");
  return { success: true, destination: dest };
}

export async function deleteDestination(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.destination.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/destinations");
  return { success: true };
}

// ================= SITE SETTINGS ACTIONS =================
export async function updateSiteSettings(settings: Record<string, string>) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: "general" },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}

// ================= GALLERY ACTIONS =================
export async function createGalleryImage(data: GalleryImageInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const img = await db.galleryImage.create({
    data: {
      title: data.title || null,
      caption: data.caption || null,
      url: data.url,
      category: data.category || "Tours",
      destinationId: data.destinationId || null,
      albumId: data.albumId || null,
      featured: Boolean(data.featured),
      published: Boolean(data.published ?? true),
      displayOrder: Number(data.displayOrder) || 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true, image: img };
}

export async function deleteGalleryImage(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.galleryImage.delete({ where: { id } });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: true };
}

// ================= CALENDAR EVENT ACTIONS =================
export interface CalendarEventInputData {
  title: string;
  slug?: string;
  eventType?: string;
  startDate: Date | string;
  endDate: Date | string;
  description?: string;
  color?: string;
  status?: string;
  packageId?: string;
  tripBatchId?: string;
  isActive?: boolean;
}

export async function createCalendarEvent(data: CalendarEventInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const eventSlug = data.slug ? slugify(data.slug) : slugify(`${data.title}-${Date.now().toString().slice(-4)}`);
    const event = await db.calendarEvent.create({
      data: {
        title: data.title,
        slug: eventSlug,
        eventType: data.eventType || "SPECIAL_EVENT",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description || null,
        color: data.color || null,
        status: data.status || "OPEN",
        packageId: data.packageId || null,
        tripBatchId: data.tripBatchId || null,
        isActive: Boolean(data.isActive ?? true),
      },
    });

    revalidatePath("/");
    revalidatePath("/upcoming-trips");
    revalidatePath("/admin/calendar");
    return { success: true, event };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return { error: "Failed to create calendar event." };
  }
}

export async function updateCalendarEvent(id: string, data: Partial<CalendarEventInputData>) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const event = await db.calendarEvent.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.eventType && { eventType: data.eventType }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.color !== undefined && { color: data.color || null }),
        ...(data.status && { status: data.status }),
        ...(data.packageId !== undefined && { packageId: data.packageId || null }),
        ...(data.tripBatchId !== undefined && { tripBatchId: data.tripBatchId || null }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      },
    });

    revalidatePath("/");
    revalidatePath("/upcoming-trips");
    revalidatePath("/admin/calendar");
    return { success: true, event };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return { error: "Failed to update calendar event." };
  }
}

export async function deleteCalendarEvent(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await db.calendarEvent.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/upcoming-trips");
    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return { error: "Failed to delete calendar event." };
  }
}


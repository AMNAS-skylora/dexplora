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
  itineraries?: Array<{ dayNumber?: number; title: string; description: string; image?: string | null; imageUrl?: string | null; meals?: string | null; accommodation?: string | null }>;
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
  badgeTag?: string;
  badge?: string;
  subtitle?: string;
  destination?: string;
  startingPrice?: number | null;
  realPrice?: number | null;
  imageUrl?: string;
  imagePublicId?: string;
  desktopImage?: string;
  mobileImage?: string;
  primaryBtnText?: string;
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
  sortOrder?: number;
  displayOrder?: number;
  isActive?: boolean;
  active?: boolean;
}

export interface DestinationInputData {
  name: string;
  slug?: string;
  state: string;
  country?: string;
  shortDescription?: string;
  coverImage?: string;
  imageUrl?: string;
  imagePublicId?: string;
  featured?: boolean;
  active?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface GalleryImageInputData {
  title?: string;
  caption?: string;
  url?: string;
  imageUrl?: string;
  imagePublicId?: string;
  altText?: string;
  category?: string;
  categoryId?: string;
  destinationId?: string;
  albumId?: string;
  featured?: boolean;
  published?: boolean;
  displayOrder?: number;
}

// Helper for unique slug generation
export async function checkPackageSlugExists(slug: string, currentPackageId?: string): Promise<boolean> {
  const normalized = slugify(slug);
  if (!normalized) return false;

  const where: any = { slug: normalized };
  if (currentPackageId) {
    where.id = { ne: currentPackageId };
  }
  const existing = await db.package.findFirst({ where });
  return Boolean(existing);
}

export async function generateUniquePackageSlug(baseTitleOrSlug: string, currentPackageId?: string): Promise<string> {
  const baseSlug = slugify(baseTitleOrSlug) || "tour-package";
  let candidate = baseSlug;
  let count = 2;

  while (await checkPackageSlugExists(candidate, currentPackageId)) {
    candidate = `${baseSlug}-${count}`;
    count++;
  }
  return candidate;
}

export async function checkSlugAvailability(slug: string, currentPackageId?: string) {
  const normalized = slugify(slug);
  if (!normalized) return { available: false, error: "Slug cannot be empty" };
  const inUse = await checkPackageSlugExists(normalized, currentPackageId);
  return { available: !inUse, slug: normalized };
}

// ================= PACKAGE ACTIONS =================
export async function createPackage(data: PackageInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const rawTitle = data.title?.trim() || "";
    if (!rawTitle) {
      return { error: "Package title is required." };
    }

    const normalizedSlug = slugify(data.slug || rawTitle);
    if (!normalizedSlug) {
      return { error: "Package slug is required." };
    }

    const slugInUse = await checkPackageSlugExists(normalizedSlug);
    let packageSlug = normalizedSlug;
    if (slugInUse) {
      if (data.slug && data.slug.trim() !== "") {
        return { error: "This slug is already being used by another package." };
      } else {
        packageSlug = await generateUniquePackageSlug(normalizedSlug);
      }
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
            imageUrl: it.imageUrl || it.image || null,
            image: it.imageUrl || it.image || null,
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
    const existingPkg = await db.package.findUnique({ where: { id } });
    if (!existingPkg) return { error: "Package not found." };

    const rawTitle = data.title?.trim() || existingPkg.title;
    const normalizedSlug = slugify(data.slug || rawTitle);
    if (!normalizedSlug) {
      return { error: "Package slug is required." };
    }

    const slugInUse = await checkPackageSlugExists(normalizedSlug, id);
    if (slugInUse) {
      return { error: "This slug is already being used by another package." };
    }
    const packageSlug = normalizedSlug;

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
            imageUrl: it.imageUrl || it.image || null,
            image: it.imageUrl || it.image || null,
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
    if (!data.packageId || !data.packageId.trim()) {
      return { error: "Please select a valid package for this departure batch." };
    }

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

export async function updateTripBatch(id: string, data: Partial<TripBatchInputData>) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const existing = await db.tripBatch.findUnique({ where: { id } });
    if (!existing) return { error: "Batch not found" };

    const totalSeats = data.totalSeats !== undefined ? Number(data.totalSeats) : existing.totalSeats;
    const bookedSeats = data.bookedSeats !== undefined ? Number(data.bookedSeats) : existing.bookedSeats;
    const availableSeats = Math.max(0, totalSeats - bookedSeats);

    let status = data.status || existing.status;
    if (availableSeats === 0) status = "SOLD_OUT";

    const updated = await db.tripBatch.update({
      where: { id },
      data: {
        ...(data.packageId && { packageId: data.packageId }),
        ...(data.batchName !== undefined && { batchName: data.batchName || null }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.priceOverride !== undefined && { priceOverride: data.priceOverride ? Number(data.priceOverride) : null }),
        totalSeats,
        bookedSeats,
        availableSeats,
        status,
        ...(data.boardingPoint !== undefined && { boardingPoint: data.boardingPoint || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    });

    revalidatePath("/upcoming-trips");
    revalidatePath("/admin/upcoming-trips");
    revalidatePath(`/admin/upcoming-trips/${id}`);
    return { success: true, batch: updated };
  } catch (error: any) {
    return { error: error?.message || "Failed to update batch." };
  }
}

export interface BookingInputData {
  tripBatchId: string;
  packageId?: string;
  customerName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  gender?: string;
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  travellerCount?: number;
  totalAmount: number;
  paidAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus?: string;
  bookingStatus?: string;
  boardingPoint?: string;
  pickupLocation?: string;
  transportType?: string;
  trainName?: string;
  trainNumber?: string;
  coach?: string;
  seatNumber?: string;
  boardingTime?: string;
  airportName?: string;
  flightNumber?: string;
  busOperator?: string;
  checkInStatus?: string;
  notes?: string;
}

export async function createBatchBooking(data: BookingInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    if (!data.tripBatchId) return { error: "Trip batch is required." };
    if (!data.customerName || !data.customerName.trim()) return { error: "Full Name is required." };
    if (!data.phone || !data.phone.trim()) return { error: "Phone Number is required." };

    const batch = await db.tripBatch.findUnique({
      where: { id: data.tripBatchId },
      include: { package: true },
    });
    if (!batch) return { error: "Associated trip batch not found." };

    const pkg = batch.package || (batch.packageId ? await db.package.findUnique({ where: { id: batch.packageId } }) : null);
    const unitPrice = Number(batch.priceOverride) || Number(pkg?.price) || 0;
    const travellerCount = Math.max(1, Number(data.travellerCount) || 1);

    // Secure server-side calculation: Total = unit price * traveller count
    const totalAmount = unitPrice * travellerCount;
    const paidAmount = Number(data.paidAmount) || 0;
    const balanceAmount = Math.max(0, totalAmount - paidAmount);

    let paymentStatus = "Pending";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partially Paid";
    }

    const bookingRef = generateBookingRef();
    const payments = paidAmount > 0 ? [{
      amount: paidAmount,
      method: data.paymentMethod || "Cash",
      transactionId: data.transactionId || null,
      paidAt: new Date(),
      notes: "Initial payment during booking creation",
    }] : [];

    const booking = await db.booking.create({
      data: {
        bookingRef,
        tripBatchId: data.tripBatchId,
        packageId: data.packageId || batch.packageId || null,
        customerName: data.customerName.trim(),
        name: data.customerName.trim(),
        phone: data.phone.trim(),
        whatsappNumber: data.whatsappNumber || data.phone.trim(),
        email: data.email || null,
        gender: data.gender || null,
        age: data.age ? Number(data.age) : null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        emergencyName: data.emergencyName || null,
        emergencyPhone: data.emergencyPhone || null,
        travellerCount,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus,
        bookingStatus: data.bookingStatus || "Confirmed",
        status: data.bookingStatus || "Confirmed",
        boardingPoint: data.boardingPoint || batch.boardingPoint || null,
        pickupLocation: data.pickupLocation || null,
        transportType: data.transportType || "Train",
        trainName: data.trainName || null,
        trainNumber: data.trainNumber || null,
        coach: data.coach || null,
        seatNumber: data.seatNumber || null,
        boardingTime: data.boardingTime || null,
        airportName: data.airportName || null,
        flightNumber: data.flightNumber || null,
        busOperator: data.busOperator || null,
        checkInStatus: data.checkInStatus || "Not Checked In",
        notes: data.notes || null,
        payments,
      },
    });

    // Recalculate trip batch seats
    const allBookings = await db.booking.findMany({ where: { tripBatchId: data.tripBatchId } });
    const totalBookedSeats = allBookings
      .filter((b: any) => b.bookingStatus !== "Cancelled" && b.status !== "CANCELLED")
      .reduce((sum: number, b: any) => sum + (b.travellerCount || 1), 0);

    const availableSeats = Math.max(0, batch.totalSeats - totalBookedSeats);
    const newBatchStatus = availableSeats === 0 ? "SOLD_OUT" : (availableSeats <= 5 ? "FILLING_FAST" : "OPEN");

    await db.tripBatch.update({
      where: { id: data.tripBatchId },
      data: {
        bookedSeats: totalBookedSeats,
        availableSeats,
        status: newBatchStatus,
      },
    });

    revalidatePath("/admin/upcoming-trips");
    revalidatePath(`/admin/upcoming-trips/${data.tripBatchId}`);
    return { success: true, booking };
  } catch (error: any) {
    console.error("Error creating batch booking:", error);
    return { error: error?.message || "Failed to create traveller booking." };
  }
}

export async function updateBatchBooking(id: string, data: Partial<BookingInputData>) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) return { error: "Booking not found" };

    const tripBatchId = data.tripBatchId || existing.tripBatchId;
    const batch = tripBatchId
      ? await db.tripBatch.findUnique({ where: { id: tripBatchId }, include: { package: true } })
      : null;
    const pkg = batch?.package || (batch?.packageId ? await db.package.findUnique({ where: { id: batch.packageId } }) : null);

    const unitPrice = Number(batch?.priceOverride) || Number(pkg?.price) || (existing.totalAmount / (existing.travellerCount || 1)) || 0;
    const travellerCount = data.travellerCount !== undefined ? Math.max(1, Number(data.travellerCount)) : (existing.travellerCount || 1);

    // Secure server-side recalculation
    const totalAmount = unitPrice * travellerCount;

    const payments = Array.isArray(existing.payments) ? existing.payments : [];
    const totalPaidHistory = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    const paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : Math.max(totalPaidHistory, Number(existing.paidAmount) || 0);
    const balanceAmount = Math.max(0, totalAmount - paidAmount);

    let paymentStatus = "Pending";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partially Paid";
    }

    const updated = await db.booking.update({
      where: { id },
      data: {
        ...(data.customerName && { customerName: data.customerName, name: data.customerName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.age !== undefined && { age: data.age ? Number(data.age) : null }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.emergencyName !== undefined && { emergencyName: data.emergencyName }),
        ...(data.emergencyPhone !== undefined && { emergencyPhone: data.emergencyPhone }),
        ...(data.travellerCount !== undefined && { travellerCount: Number(data.travellerCount) }),
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus,
        ...(data.bookingStatus && { bookingStatus: data.bookingStatus, status: data.bookingStatus }),
        ...(data.boardingPoint !== undefined && { boardingPoint: data.boardingPoint }),
        ...(data.pickupLocation !== undefined && { pickupLocation: data.pickupLocation }),
        ...(data.transportType !== undefined && { transportType: data.transportType }),
        ...(data.trainName !== undefined && { trainName: data.trainName }),
        ...(data.trainNumber !== undefined && { trainNumber: data.trainNumber }),
        ...(data.coach !== undefined && { coach: data.coach }),
        ...(data.seatNumber !== undefined && { seatNumber: data.seatNumber }),
        ...(data.boardingTime !== undefined && { boardingTime: data.boardingTime }),
        ...(data.airportName !== undefined && { airportName: data.airportName }),
        ...(data.flightNumber !== undefined && { flightNumber: data.flightNumber }),
        ...(data.busOperator !== undefined && { busOperator: data.busOperator }),
        ...(data.checkInStatus !== undefined && { checkInStatus: data.checkInStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    if (existing.tripBatchId) {
      const batch = await db.tripBatch.findUnique({ where: { id: existing.tripBatchId } });
      if (batch) {
        const allBookings = await db.booking.findMany({ where: { tripBatchId: existing.tripBatchId } });
        const totalBookedSeats = allBookings
          .filter((b: any) => b.bookingStatus !== "Cancelled" && b.status !== "CANCELLED")
          .reduce((sum: number, b: any) => sum + (b.travellerCount || 1), 0);

        const availableSeats = Math.max(0, batch.totalSeats - totalBookedSeats);
        const newBatchStatus = availableSeats === 0 ? "SOLD_OUT" : (availableSeats <= 5 ? "FILLING_FAST" : "OPEN");

        await db.tripBatch.update({
          where: { id: existing.tripBatchId },
          data: {
            bookedSeats: totalBookedSeats,
            availableSeats,
            status: newBatchStatus,
          },
        });
      }
    }

    revalidatePath("/admin/upcoming-trips");
    if (existing.tripBatchId) {
      revalidatePath(`/admin/upcoming-trips/${existing.tripBatchId}`);
    }
    return { success: true, booking: updated };
  } catch (error: any) {
    console.error("Error updating batch booking:", error);
    return { error: error?.message || "Failed to update traveller booking." };
  }
}

export async function addPaymentToBooking(
  bookingId: string,
  paymentData: { amount: number; method: string; transactionId?: string; notes?: string }
) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { error: "Booking not found" };

    const newPayment = {
      amount: Number(paymentData.amount) || 0,
      method: paymentData.method || "Cash",
      transactionId: paymentData.transactionId || null,
      paidAt: new Date(),
      notes: paymentData.notes || null,
    };

    const existingPayments = Array.isArray(booking.payments) ? booking.payments : [];
    const updatedPayments = [...existingPayments, newPayment];

    const totalPaid = updatedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAmount = Number(booking.totalAmount) || 0;
    const balanceAmount = Math.max(0, totalAmount - totalPaid);

    let paymentStatus = "Pending";
    if (totalPaid >= totalAmount && totalAmount > 0) {
      paymentStatus = "Paid";
    } else if (totalPaid > 0) {
      paymentStatus = "Partially Paid";
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        payments: updatedPayments,
        paidAmount: totalPaid,
        balanceAmount,
        paymentStatus,
      },
    });

    revalidatePath("/admin/upcoming-trips");
    if (booking.tripBatchId) {
      revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}`);
    }
    return { success: true, booking: updated };
  } catch (error: any) {
    console.error("Error adding payment:", error);
    return { error: error?.message || "Failed to record payment." };
  }
}

export async function deleteBatchBooking(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const booking = await db.booking.findUnique({ where: { id } });
    await db.booking.delete({ where: { id } });

    if (booking?.tripBatchId) {
      const batch = await db.tripBatch.findUnique({ where: { id: booking.tripBatchId } });
      if (batch) {
        const allBookings = await db.booking.findMany({ where: { tripBatchId: booking.tripBatchId } });
        const totalBookedSeats = allBookings
          .filter((b: any) => b.bookingStatus !== "Cancelled" && b.status !== "CANCELLED")
          .reduce((sum: number, b: any) => sum + (b.travellerCount || 1), 0);

        const availableSeats = Math.max(0, batch.totalSeats - totalBookedSeats);
        const newBatchStatus = availableSeats === 0 ? "SOLD_OUT" : (availableSeats <= 5 ? "FILLING_FAST" : "OPEN");

        await db.tripBatch.update({
          where: { id: booking.tripBatchId },
          data: {
            bookedSeats: totalBookedSeats,
            availableSeats,
            status: newBatchStatus,
          },
        });
      }
      revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}`);
    }

    revalidatePath("/admin/upcoming-trips");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return { error: error?.message || "Failed to delete booking." };
  }
}

export async function addTravellerToBookingList(
  bookingId: string,
  travellerData: { name: string; age?: number; gender?: string; phone?: string; boardingPoint?: string; transportType?: string; seatNumber?: string }
) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { error: "Booking not found" };

    const newTraveller = {
      id: `TRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: travellerData.name.trim(),
      age: travellerData.age ? Number(travellerData.age) : null,
      gender: travellerData.gender || "Male",
      phone: travellerData.phone ? travellerData.phone.trim() : null,
      boardingPoint: travellerData.boardingPoint || booking.boardingPoint || null,
      transportType: travellerData.transportType || booking.transportType || "Train",
      seatNumber: travellerData.seatNumber || null,
      checkInStatus: "Not Checked In",
    };

    const existingTravellers = Array.isArray(booking.travellers) ? booking.travellers : [];
    const updatedTravellers = [...existingTravellers, newTraveller];
    const newTravellerCount = updatedTravellers.length;

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        travellers: updatedTravellers,
        travellerCount: newTravellerCount,
      },
    });

    if (booking.tripBatchId) {
      const batch = await db.tripBatch.findUnique({ where: { id: booking.tripBatchId } });
      if (batch) {
        const allBookings = await db.booking.findMany({ where: { tripBatchId: booking.tripBatchId } });
        const totalBookedSeats = allBookings
          .filter((b: any) => b.bookingStatus !== "Cancelled" && b.status !== "CANCELLED")
          .reduce((sum: number, b: any) => sum + (b.travellerCount || 1), 0);

        const availableSeats = Math.max(0, batch.totalSeats - totalBookedSeats);
        const newBatchStatus = availableSeats === 0 ? "SOLD_OUT" : (availableSeats <= 5 ? "FILLING_FAST" : "OPEN");

        await db.tripBatch.update({
          where: { id: booking.tripBatchId },
          data: {
            bookedSeats: totalBookedSeats,
            availableSeats,
            status: newBatchStatus,
          },
        });
      }
      revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}`);
      revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}/customers/${bookingId}`);
    }

    return { success: true, booking: updated };
  } catch (error: any) {
    console.error("Error adding traveller to booking:", error);
    return { error: error?.message || "Failed to add traveller." };
  }
}

export async function toggleCheckInStatus(bookingId: string, checkInStatus: string, travellerId?: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { error: "Booking not found" };

    let updatedTravellers = Array.isArray(booking.travellers) ? [...booking.travellers] : [];

    if (travellerId && updatedTravellers.length > 0) {
      updatedTravellers = updatedTravellers.map((t: any) =>
        t.id === travellerId ? { ...t, checkInStatus } : t
      );
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        checkInStatus,
        ...(updatedTravellers.length > 0 && { travellers: updatedTravellers }),
      },
    });

    if (booking.tripBatchId) {
      revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}`);
      revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}/customers/${bookingId}`);
    }
    return { success: true, booking: updated };
  } catch (error: any) {
    console.error("Error updating check-in status:", error);
    return { error: error?.message || "Failed to update check-in status." };
  }
}

// ================= HERO SLIDE ACTIONS =================
export async function createHeroSlide(data: HeroSlideInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const image = data.imageUrl || data.desktopImage || "";
  const bTag = data.badgeTag || data.badge || null;
  const order = data.sortOrder !== undefined ? data.sortOrder : (data.displayOrder || 0);
  const isAct = data.isActive !== undefined ? data.isActive : (data.active !== undefined ? data.active : true);

  const slide = await db.heroSlide.create({
    data: {
      title: data.title,
      badgeTag: bTag,
      badge: bTag,
      subtitle: data.subtitle || null,
      destination: data.destination || null,
      startingPrice: data.startingPrice !== undefined && data.startingPrice !== null ? Number(data.startingPrice) : null,
      realPrice: data.realPrice !== undefined && data.realPrice !== null ? Number(data.realPrice) : null,
      imageUrl: image,
      imagePublicId: data.imagePublicId || null,
      desktopImage: image,
      mobileImage: data.mobileImage || null,
      primaryBtnText: data.primaryBtnText || "Explore Package",
      primaryBtnUrl: data.primaryBtnUrl || "/packages",
      secondaryBtnText: data.secondaryBtnText || null,
      secondaryBtnUrl: data.secondaryBtnUrl || null,
      sortOrder: Number(order) || 0,
      displayOrder: Number(order) || 0,
      isActive: Boolean(isAct),
      active: Boolean(isAct),
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

// (Destination Actions defined below)

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
export async function quickCreateGalleryCategory(rawName: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized access" };

  const name = rawName.trim();
  if (!name) return { error: "Category name is required." };

  const slug = slugify(name);

  try {
    const allCategories = await db.galleryCategory.findMany();
    const existing = allCategories.find(
      (c: any) =>
        c.name?.trim().toLowerCase() === name.toLowerCase() ||
        c.slug?.trim().toLowerCase() === slug.toLowerCase()
    );

    if (existing) {
      return { category: existing };
    }

    const newCat = await db.galleryCategory.create({
      data: {
        name,
        slug,
      },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { category: newCat };
  } catch (err: any) {
    console.error("Error quick-creating category:", err);
    return { error: err?.message || "Failed to create category." };
  }
}

export async function createGalleryImage(data: GalleryImageInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const imgUrl = data.imageUrl || data.url;
  if (!imgUrl || !imgUrl.trim()) {
    return { error: "Gallery image is required." };
  }

  const categoryName = data.category ? data.category.trim() : "General";

  try {
    const altText = data.altText?.trim() || data.title?.trim() || data.caption?.trim() || "Gallery Photo";

    const img = await db.galleryImage.create({
      data: {
        title: data.title?.trim() || null,
        caption: data.caption?.trim() || null,
        url: imgUrl.trim(),
        imageUrl: imgUrl.trim(),
        imagePublicId: data.imagePublicId ? data.imagePublicId.trim() : null,
        altText,
        category: categoryName,
        categoryId: data.categoryId || null,
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
  } catch (error: any) {
    console.error("Create gallery image error:", error);
    return { error: error?.message || "Failed to create gallery photo." };
  }
}

export async function updateGalleryImage(id: string, data: Partial<GalleryImageInputData>) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const existing = await db.galleryImage.findUnique({ where: { id } });
    if (!existing) return { error: "Gallery image not found" };

    const imgUrl = data.imageUrl || data.url || existing.imageUrl || existing.url;
    if (!imgUrl) return { error: "Gallery image is required." };

    const categoryName = data.category !== undefined ? data.category.trim() : existing.category;

    const updated = await db.galleryImage.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() || null }),
        ...(data.caption !== undefined && { caption: data.caption.trim() || null }),
        url: imgUrl,
        imageUrl: imgUrl,
        ...(data.imagePublicId !== undefined && { imagePublicId: data.imagePublicId || null }),
        ...(data.altText !== undefined && { altText: data.altText.trim() || null }),
        category: categoryName,
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.destinationId !== undefined && { destinationId: data.destinationId || null }),
        ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
        ...(data.published !== undefined && { published: Boolean(data.published) }),
      },
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true, image: updated };
  } catch (error: any) {
    console.error("Update gallery image error:", error);
    return { error: error?.message || "Failed to update gallery photo." };
  }
}

export async function deleteGalleryImage(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const existing = await db.galleryImage.findUnique({ where: { id } });
    if (!existing) return { error: "Gallery image not found" };

    await db.galleryImage.delete({ where: { id } });

    // Clean up Cloudinary asset if publicId is present
    if (existing.imagePublicId) {
      try {
        const { cloudinary } = await import("@/lib/cloudinary");
        await cloudinary.uploader.destroy(existing.imagePublicId);
      } catch (cloudErr) {
        console.error("Failed to delete Cloudinary gallery image:", cloudErr);
      }
    }

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("Delete gallery image error:", error);
    return { error: error?.message || "Failed to delete gallery photo." };
  }
}

export async function createDestination(data: DestinationInputData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const name = (data.name || "").trim();
  if (!name) return { error: "Destination name is required." };

  const slug = data.slug ? slugify(data.slug) : slugify(name);

  try {
    const allDestinations = await db.destination.findMany();
    const existing = allDestinations.find(
      (d: any) =>
        d.name?.trim().toLowerCase() === name.toLowerCase() ||
        d.slug?.trim().toLowerCase() === slug.toLowerCase()
    );

    if (existing) {
      return { error: "Destination already exists." };
    }

    const image = data.imageUrl || data.coverImage || null;
    const isAct = data.active !== undefined ? data.active : (data.isActive !== undefined ? data.isActive : true);

    const newDest = await db.destination.create({
      data: {
        name,
        slug,
        state: (data.state || "").trim(),
        country: (data.country || "India").trim(),
        shortDescription: data.shortDescription || null,
        coverImage: image,
        imageUrl: image,
        imagePublicId: data.imagePublicId || null,
        featured: Boolean(data.featured),
        active: isAct,
        isActive: isAct,
        displayOrder: Number(data.displayOrder) || 0,
      },
    });

    revalidatePath("/admin/destinations");
    revalidatePath("/admin/packages");
    revalidatePath("/destinations");
    return { success: true, destination: newDest };
  } catch (error: any) {
    console.error("Create destination error:", error);
    return { error: error?.message || "Failed to create destination." };
  }
}

export async function updateDestination(id: string, data: Partial<DestinationInputData>) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const existingDest = await db.destination.findUnique({ where: { id } });
    if (!existingDest) return { error: "Destination not found" };

    const name = data.name !== undefined ? data.name.trim() : existingDest.name;
    if (!name) return { error: "Destination name is required." };

    const slug = data.slug ? slugify(data.slug) : slugify(name);

    const allDestinations = await db.destination.findMany();
    const duplicate = allDestinations.find(
      (d: any) =>
        d.id !== id &&
        (d.name?.trim().toLowerCase() === name.toLowerCase() ||
          d.slug?.trim().toLowerCase() === slug.toLowerCase())
    );

    if (duplicate) {
      return { error: "Destination already exists." };
    }

    const image = data.imageUrl !== undefined ? data.imageUrl : (data.coverImage !== undefined ? data.coverImage : existingDest.imageUrl);
    const isAct = data.active !== undefined ? data.active : (data.isActive !== undefined ? data.isActive : existingDest.active);

    const updated = await db.destination.update({
      where: { id },
      data: {
        name,
        slug,
        ...(data.state !== undefined && { state: data.state.trim() }),
        ...(data.country !== undefined && { country: data.country.trim() }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription || null }),
        coverImage: image,
        imageUrl: image,
        ...(data.imagePublicId !== undefined && { imagePublicId: data.imagePublicId || null }),
        ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
        active: isAct,
        isActive: isAct,
        ...(data.displayOrder !== undefined && { displayOrder: Number(data.displayOrder) }),
      },
    });

    revalidatePath("/admin/destinations");
    revalidatePath("/admin/packages");
    revalidatePath("/destinations");
    return { success: true, destination: updated };
  } catch (error: any) {
    console.error("Update destination error:", error);
    return { error: error?.message || "Failed to update destination." };
  }
}

export async function deleteDestination(id: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const linkedPackagesCount = await db.package.count({ where: { destinationId: id } });
    if (linkedPackagesCount > 0) {
      return {
        error: `This destination is used by ${linkedPackagesCount} package${linkedPackagesCount === 1 ? "" : "s"}. Please reassign or delete linked packages first.`,
      };
    }

    await db.destination.delete({ where: { id } });
    revalidatePath("/admin/destinations");
    revalidatePath("/admin/packages");
    revalidatePath("/destinations");
    return { success: true };
  } catch (error: any) {
    console.error("Delete destination error:", error);
    return { error: error?.message || "Failed to delete destination." };
  }
}

export async function quickCreateDestination(rawName: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized access" };

  const name = rawName.trim();
  if (!name) return { error: "Destination name is required." };

  const slug = slugify(name);

  try {
    const allDestinations = await db.destination.findMany();
    const existing = allDestinations.find(
      (d: any) =>
        d.name?.trim().toLowerCase() === name.toLowerCase() ||
        d.slug?.trim().toLowerCase() === slug.toLowerCase()
    );

    if (existing) {
      return { destination: existing };
    }

    const newDest = await db.destination.create({
      data: {
        name,
        slug,
        active: true,
      },
    });

    revalidatePath("/admin/destinations");
    revalidatePath("/admin/packages");
    return { destination: newDest };
  } catch (err: any) {
    console.error("Error quick-creating destination:", err);
    return { error: err?.message || "Failed to create destination." };
  }
}



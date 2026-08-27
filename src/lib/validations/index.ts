import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  whatsappNumber: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  packageId: z.string().min(1, "Please select a package"),
  batchId: z.string().optional(),
  numberOfTravellers: z.coerce.number().min(1, "At least 1 traveler required"),
  adults: z.coerce.number().min(1, "At least 1 adult required"),
  children: z.coerce.number().min(0).default(0),
  preferredDate: z.string().optional(),
  boardingLocation: z.string().optional(),
  message: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  subject: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export const reviewSchema = z.object({
  customerName: z.string().min(2, "Your name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  tripName: z.string().min(2, "Package / trip name is required"),
  rating: z.coerce.number().min(1).max(5).default(5),
  review: z.string().min(10, "Review must be at least 10 characters long"),
  travelDate: z.string().optional(),
  customerPhoto: z.string().optional(),
});

export const packageSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  shortDescription: z.string().min(10, "Short description required"),
  fullDescription: z.string().min(20, "Full description required"),
  destinationId: z.string().min(1, "Destination is required"),
  tripType: z.string().default("Group Trip"),
  coverImage: z.string().min(1, "Cover image URL required"),
  duration: z.string().min(1, "Duration required"),
  price: z.coerce.number().min(0, "Price required"),
  originalPrice: z.coerce.number().optional(),
  departureLocation: z.string().min(1, "Departure location required"),
  arrivalLocation: z.string().min(1, "Arrival location required"),
  accommodation: z.string().default("3-Star Hotel / Resort"),
  transportation: z.string().default("Train & Private AC Bus"),
  guideInfo: z.string().default("Malayali Tour Leader"),
  meals: z.string().default("Breakfast & Dinner"),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "SOLD_OUT", "ARCHIVED"]).default("PUBLISHED"),
  displayOrder: z.coerce.number().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const batchSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  batchName: z.string().optional(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  priceOverride: z.coerce.number().optional(),
  totalSeats: z.coerce.number().min(1).default(30),
  bookedSeats: z.coerce.number().min(0).default(0),
  availableSeats: z.coerce.number().min(0).default(30),
  status: z.enum(["UPCOMING", "OPEN", "FILLING_FAST", "ALMOST_FULL", "SOLD_OUT", "COMPLETED", "CANCELLED"]).default("OPEN"),
  boardingPoint: z.string().optional(),
  notes: z.string().optional(),
});

export const destinationSchema = z.object({
  name: z.string().min(2, "Destination name required"),
  slug: z.string().min(2, "Slug required"),
  state: z.string().min(2, "State required"),
  country: z.string().default("India"),
  shortDescription: z.string().optional(),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  displayOrder: z.coerce.number().default(0),
});

export const heroSlideSchema = z.object({
  title: z.string().min(2, "Title required"),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  destination: z.string().optional(),
  startingPrice: z.coerce.number().optional(),
  desktopImage: z.string().min(1, "Desktop image required"),
  mobileImage: z.string().optional(),
  primaryBtnText: z.string().default("Explore Package"),
  primaryBtnUrl: z.string().default("/packages"),
  secondaryBtnText: z.string().optional(),
  secondaryBtnUrl: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

export const settingsSchema = z.record(z.string(), z.string());

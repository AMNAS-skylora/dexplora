# Dexplora Tour Planners — Full Production Website & Admin Panel

A production-ready, mobile-first travel and adventure tour management web application for **Dexplora Tour Planners** built with **Next.js 16+ App Router**, **TypeScript**, **Tailwind CSS**, **MongoDB**, and secure admin authentication.

---

## 🌟 Key Features

### A. Public Customer Site
- **Hero Slider**: Responsive homepage travel slider with mobile crop, badges, price tag, and dual CTAs.
- **Tour Packages**: Searchable & filterable tour packages by destination, duration, price range, and trip type (`/packages`, `/packages/[slug]`).
- **Upcoming Departures**: Group departure batch calendar showing seats left, status badges (`Filling Fast`, `Open`, `Sold Out`), and booking action buttons (`/upcoming-trips`).
- **Interactive Gallery**: Filterable photography grid with full-screen Lightbox modal (`/gallery`).
- **Customer Reviews**: Moderated testimonial review queue (`/reviews`) where customers submit reviews for admin approval.
- **Booking Enquiries**: Comprehensive booking form generating unique reference codes (`DEX-2026-XXXXXX`) with auto-prefilled WhatsApp confirmation (`/book-now`).
- **Mobile First UX**: Sticky bottom booking action bar (`WhatsApp | Book Now`), lock-scroll mobile menu, zero horizontal overflow.

### B. Admin Control Panel (`/admin`)
- **Protected Portal**: Secure JWT cookie session authentication & password hashing.
- **Live Statistics Dashboard**: Real-time database metrics for total packages, upcoming trips, bookings, enquiries, and pending reviews.
- **Package Manager**: Full CRUD builder with day-by-day itineraries, inclusions, exclusions, FAQs, and price controls.
- **Batch Departure Manager**: Schedule departure dates, total/booked seats, and statuses.
- **Testimonial Queue**: Moderate pending customer submissions (`Approve`, `Reject`, `Feature`).
- **Booking & Enquiry Manager**: Track booking status (`NEW`, `READ`, `CONTACTED`, `CONFIRMED`) and customer enquiries.
- **Website Settings**: Dynamically manage phone numbers (`+91 7034 267 985`, `+91 7034 267 986`), WhatsApp, address, social links, and SEO tags without code edits.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB (Native Node Driver)
- **Authentication**: Custom JWT Session Cookie (`jose` & `bcryptjs`)
- **Form & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **Slider**: Swiper.js

---

## 🚀 Setup & Installation Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI` / `DATABASE_URL` is set.

### 4. Seed Database Starter Content
Populates Super Admin credentials, initial packages (Kerala to Meghalaya @ ₹14,499, Mahabaleshwar @ ₹5,699, Matheran @ ₹4,299), destinations, hero slides, approved reviews, and site settings:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Admin Credentials

- **Admin Login URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@dexplora.com`
- **Password**: `DexploraAdmin2026!`

---

## 🏗️ Production Build Verification

To verify standard production compilation:
```bash
npm run build
npm start
```

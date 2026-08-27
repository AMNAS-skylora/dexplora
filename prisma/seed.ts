import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Dexplora database seed...");

  // 1. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dexplora.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "DexploraAdmin2026!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      name: "Dexplora Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ Admin user created/updated: ${adminUser.email}`);

  // 2. Site Settings
  const settings = [
    { key: "company_name", value: "Dexplora Tour Planners", group: "general" },
    { key: "tagline", value: "Your Gateway to Unforgettable Group Adventures", group: "general" },
    { key: "phone_1", value: "+91 70342 67985", group: "contact" },
    { key: "phone_2", value: "+91 70342 67986", group: "contact" },
    { key: "whatsapp_number", value: "917034267985", group: "contact" },
    { key: "email", value: "dexploraindia@gmail.com", group: "contact" },
    { key: "address", value: "Dexplora Tour Planners, MG Road, Kochi, Kerala 682016", group: "contact" },
    { key: "google_maps_link", value: "https://maps.google.com", group: "contact" },
    { key: "instagram_url", value: "https://www.instagram.com/dexplora_tourplanners?igsi=czh3MGY5YnpxaDJ3&utm_source=qr", group: "social" },
    { key: "facebook_url", value: "", group: "social" },
    { key: "youtube_url", value: "https://youtube.com/@dexploratours", group: "social" },
    { key: "seo_title", value: "Dexplora Tour Planners | Budget & Group Trips from Kerala", group: "seo" },
    { key: "seo_description", value: "Book Malayali guided group tours to Meghalaya, Mahabaleshwar, Matheran, Kashmir & Goa with Dexplora Tour Planners. Affordable, premium stays & unforgettable experiences.", group: "seo" },
    { key: "footer_text", value: "Dexplora Tour Planners is a premier Kerala-based adventure travel agency organizing curated budget group trips and customized holiday packages across India.", group: "footer" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }
  console.log("✅ Site settings created");

  // 3. About Content
  const existingAbout = await prisma.aboutContent.findFirst();
  if (!existingAbout) {
    await prisma.aboutContent.create({
      data: {
        title: "About Dexplora Tour Planners",
        subtitle: "Crafting unforgettable travel memories with genuine Malayali hospitality and budget-friendly luxury.",
        story: "Founded in Kerala with a passion for wanderlust, Dexplora Tour Planners started with a vision to make breathtaking destinations accessible to every travel enthusiast. From the misty hills of Meghalaya to the serene Sahyadri valleys of Mahabaleshwar and Matheran, we specialize in organizing seamless, safe, and exhilarating group departures led by friendly Malayali tour leaders.",
        mission: "To provide world-class, budget-conscious travel experiences with end-to-end assistance, comfortable stays, transparent pricing, and vibrant group vibes.",
        vision: "To be South India's most trusted and loved adventure tour brand for customized family getaways and energetic group explorations.",
        philosophy: "Travel isn't just about destinations; it's about the people you share the journey with, the cultures you discover, and the lifelong memories you bring home.",
        statsJson: JSON.stringify([
          { label: "Happy Travelers", value: "10,000+" },
          { label: "Group Trip Completed", value: "450+" },
          { label: "Destinations Covered", value: "25+" },
          { label: "Malayali Tour Leaders", value: "15+" },
        ]),
        teamJson: JSON.stringify([
          { name: "Arjun Ramesh", role: "Founder & Lead Explorer", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" },
          { name: "Sneha Nair", role: "Tour Operations Manager", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80" },
        ]),
      },
    });
  }
  console.log("✅ About content initialized");

  // 4. Destinations
  const destMeghalaya = await prisma.destination.upsert({
    where: { slug: "meghalaya" },
    update: {},
    create: {
      name: "Meghalaya",
      slug: "meghalaya",
      state: "Meghalaya",
      country: "India",
      shortDescription: "The Abode of Clouds featuring living root bridges, crystal clear rivers in Dawki, and majestic waterfalls.",
      coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      displayOrder: 1,
    },
  });

  const destMahabaleshwar = await prisma.destination.upsert({
    where: { slug: "mahabaleshwar" },
    update: {},
    create: {
      name: "Mahabaleshwar",
      slug: "mahabaleshwar",
      state: "Maharashtra",
      country: "India",
      shortDescription: "Queen of Maharashtra hill stations famous for lush strawberry farms, Sahyadri valleys, and cool mountain air.",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      displayOrder: 2,
    },
  });

  const destMatheran = await prisma.destination.upsert({
    where: { slug: "matheran" },
    update: {},
    create: {
      name: "Matheran",
      slug: "matheran",
      state: "Maharashtra",
      country: "India",
      shortDescription: "Asia's only eco-sensitive car-free hill station surrounded by red soil trails and pristine nature lookouts.",
      coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      displayOrder: 3,
    },
  });

  const destKashmir = await prisma.destination.upsert({
    where: { slug: "kashmir" },
    update: {},
    create: {
      name: "Kashmir",
      slug: "kashmir",
      state: "Jammu & Kashmir",
      country: "India",
      shortDescription: "Paradise on Earth with Dal Lake Shikara rides, snow peaks of Gulmarg, and romantic pine valleys of Pahalgam.",
      coverImage: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      displayOrder: 4,
    },
  });

  const destGoa = await prisma.destination.upsert({
    where: { slug: "goa" },
    update: {},
    create: {
      name: "Goa",
      slug: "goa",
      state: "Goa",
      country: "India",
      shortDescription: "Golden beaches, vibrant nightlife, Portuguese heritage cathedrals, and thrilling watersports.",
      coverImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      featured: false,
      displayOrder: 5,
    },
  });
  console.log("✅ Destinations created");

  // 5. Hero Slides
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      {
        title: "Explore Meghalaya",
        subtitle: "Kerala to Northeast Special Group Departure",
        badge: "Most Popular Group Trip",
        destination: "Meghalaya",
        startingPrice: 14499,
        desktopImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80",
        mobileImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        primaryBtnText: "Explore Meghalaya Package",
        primaryBtnUrl: "/packages/kerala-to-meghalaya-group-package",
        secondaryBtnText: "WhatsApp Assistance",
        secondaryBtnUrl: "https://wa.me/917034267985?text=Hi%20Dexplora,%20I%20am%20interested%20in%20Meghalaya%20Trip",
        displayOrder: 1,
        active: true,
      },
      {
        title: "Mahabaleshwar Getaway",
        subtitle: "Resort Stay, Swimming Pool & Sahyadri Valleys",
        badge: "Budget Friendly departure",
        destination: "Maharashtra",
        startingPrice: 5699,
        desktopImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
        mobileImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        primaryBtnText: "View Package",
        primaryBtnUrl: "/packages/mahabaleshwar-group-departure",
        secondaryBtnText: "Book Seats Now",
        secondaryBtnUrl: "/book-now",
        displayOrder: 2,
        active: true,
      },
      {
        title: "Matheran Eco-Escape",
        subtitle: "Asia's Only Car-Free Hill Station Weekend Tour",
        badge: "Weekend Special",
        destination: "Maharashtra",
        startingPrice: 4299,
        desktopImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80",
        mobileImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
        primaryBtnText: "Explore Package",
        primaryBtnUrl: "/packages/matheran-weekend-getaway",
        secondaryBtnText: "Contact Us",
        secondaryBtnUrl: "/contact",
        displayOrder: 3,
        active: true,
      },
    ],
  });
  console.log("✅ Hero slides created");

  // 6. Packages
  // Package 1: Meghalaya
  const p1 = await prisma.package.upsert({
    where: { slug: "kerala-to-meghalaya-group-package" },
    update: {},
    create: {
      title: "Kerala to Meghalaya Group Package",
      slug: "kerala-to-meghalaya-group-package",
      shortDescription: "Experience the spellbinding beauty of Shillong, Cherrapunji, Dawki glass-like river, and living root bridges with Malayali tour leader support.",
      fullDescription: "Join Dexplora Tour Planners on an extraordinary journey from Kerala to the Abode of Clouds — Meghalaya! This signature group departure takes you across Northeast India's most magical sights. From the cascading Wei Sawdong and Nohkalikai falls to the world's cleanest village (Mawlynnong) and the famous crystal-clear Umngot River at Dawki where boats seem to float in mid-air. All arrangements are crafted for comfort, safety, and epic group memories.",
      destinationId: destMeghalaya.id,
      tripType: "Group Departure",
      coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
      duration: "6 Days / 5 Nights",
      price: 14499,
      originalPrice: 17999,
      departureLocation: "Kerala (Kochi / Calicut / Trivandrum)",
      arrivalLocation: "Guwahati / Shillong",
      accommodation: "3-Star Deluxe Hotel & Nature Resorts",
      transportation: "Train / Flight + Private Tempo Traveller",
      guideInfo: "Experienced Malayali Tour Manager & Local Guide",
      meals: "Breakfast & Dinner (Kerala / South Indian options)",
      featured: true,
      popular: true,
      status: "PUBLISHED",
      displayOrder: 1,
      seoTitle: "Kerala to Meghalaya Group Trip Package ₹14,499 | Dexplora",
      seoDescription: "Book Kerala to Meghalaya budget group tour package with Dexplora. Includes train/flight assistance, 3-star stay, Dawki, Cherrapunji & Malayali leader.",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80", caption: "Nohkalikai Waterfall Cherrapunji" },
          { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80", caption: "Dawki Crystal Clear Umngot River" },
          { url: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1000&q=80", caption: "Living Root Bridge Meghalaya" },
        ],
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: "Kerala Departure & Journey to Northeast",
            description: "Assemble at designated Kerala railway station/airport. Meet your Dexplora Malayali Tour Leader and fellow travelers. Over-night journey packed with fun icebreakers and team bonding.",
            meals: "Snacks provided",
            accommodation: "Train / Transit",
          },
          {
            dayNumber: 2,
            title: "Arrival in Guwahati & Drive to Shillong",
            description: "Arrive at Guwahati. Board our comfortable AC vehicle. Stop at scenic Umiam Lake (Barapani) for evening tea and photography. Check-in to Shillong hotel. Evening stroll at Police Bazar.",
            meals: "Dinner",
            accommodation: "Shillong 3-Star Hotel",
          },
          {
            dayNumber: 3,
            title: "Shillong to Cherrapunji Sightseeing",
            description: "Drive through cloud-laden mountain passes. Visit Elephant Falls, Mawkdok Dympep Valley Viewpoint, Nohkalikai Falls, and Mawsmai Caves. Experience local Khasi hospitality.",
            meals: "Breakfast & Dinner",
            accommodation: "Cherrapunji Resort",
          },
          {
            dayNumber: 4,
            title: "Dawki Umngot River & Mawlynnong Cleanest Village",
            description: "Head to Dawki at the Indo-Bangladesh border. Enjoy a magical boat ride on the crystal transparent Umngot River. Visit Mawlynnong — Asia's cleanest village — and see the Single-Decker Living Root Bridge.",
            meals: "Breakfast & Dinner",
            accommodation: "Dawki / Shillong Stay",
          },
          {
            dayNumber: 5,
            title: "Laitlum Canyons & Shillong Peak",
            description: "Explore breathtaking panoramic views at Laitlum Canyons ('End of the World'). Return to Shillong for local handicraft shopping and group farewell music evening.",
            meals: "Breakfast & Dinner",
            accommodation: "Shillong Hotel",
          },
          {
            dayNumber: 6,
            title: "Guwahati Kamakhya Temple & Return Journey",
            description: "Drive back to Guwahati. Optional morning visit to Kamakhya Temple. Drop at Railway Station/Airport for return trip to Kerala with cherished memories.",
            meals: "Breakfast",
            accommodation: "Return Journey",
          },
        ],
      },
      inclusions: {
        create: [
          { text: "Round-trip train fare / flight assistance from Kerala" },
          { text: "5 Nights accommodation in double/triple sharing 3-star stay" },
          { text: "Daily Breakfast and Dinner with Malayali/South Indian preference" },
          { text: "All internal transfers in private AC vehicle" },
          { text: "Experienced Dexplora Malayali Tour Manager throughout the trip" },
          { text: "Dawki boat ride tickets & entry passes to all listed attractions" },
          { text: "Driver allowances, toll fees, state taxes, and fuel charges" },
        ],
      },
      exclusions: {
        create: [
          { text: "Lunch meals and personal snack beverages" },
          { text: "Camera permits or optional adventure activity charges" },
          { text: "Anything not explicitly mentioned under inclusions" },
        ],
      },
      faqs: {
        create: [
          { question: "Is this package family and solo-female friendly?", answer: "Yes! All Dexplora group trips are carefully curated with dedicated Malayali tour leaders ensuring maximum safety, comfort, and inclusivity." },
          { question: "Can we customize our departure location from Kerala?", answer: "Absolutely. We arrange boarding from Trivandrum, Ernakulam (Kochi), Thrissur, Calicut, or Kannur." },
        ],
      },
      batches: {
        create: [
          {
            batchName: "October Autumn Departure",
            startDate: new Date("2026-10-15"),
            endDate: new Date("2026-10-21"),
            totalSeats: 30,
            bookedSeats: 18,
            availableSeats: 12,
            status: "FILLING_FAST",
            boardingPoint: "Kochi / Calicut Railway Station",
          },
          {
            batchName: "November Winter Special",
            startDate: new Date("2026-11-10"),
            endDate: new Date("2026-11-16"),
            totalSeats: 30,
            bookedSeats: 8,
            availableSeats: 22,
            status: "OPEN",
            boardingPoint: "Kochi Railway Station",
          },
        ],
      },
    },
  });

  // Package 2: Mahabaleshwar
  const p2 = await prisma.package.upsert({
    where: { slug: "mahabaleshwar-group-departure" },
    update: {},
    create: {
      title: "Mahabaleshwar Group Departure",
      slug: "mahabaleshwar-group-departure",
      shortDescription: "4-Day mountain escape featuring strawberry farms, 3-star resort stay with swimming pool, sightseeing bus, and Malayali guide.",
      fullDescription: "Escape to the cool, mist-covered hills of Mahabaleshwar and Panchgani! This special budget group trip organized by Dexplora is packed with fun activities, strawberry farm visits, Arthur Seat point, Venna Lake boating, and relaxing resort time with a private swimming pool.",
      destinationId: destMahabaleshwar.id,
      tripType: "Group Tour",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      duration: "4 Days / 3 Nights",
      price: 5699,
      originalPrice: 7499,
      departureLocation: "Kerala / Mumbai / Pune Boarding",
      arrivalLocation: "Mahabaleshwar",
      accommodation: "3-Star Hill Resort with Swimming Pool",
      transportation: "Train Ticket + AC Sightseeing Coach",
      guideInfo: "Malayali Tour Leader",
      meals: "Breakfast & Dinner",
      featured: true,
      popular: true,
      status: "PUBLISHED",
      displayOrder: 2,
      seoTitle: "Mahabaleshwar Group Departure Package ₹5,699 | Dexplora",
      seoDescription: "Join Dexplora Mahabaleshwar group trip for ₹5,699. 3-star resort with swimming pool, train ticket, sightseeing, and Malayali guide included.",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80", caption: "Mahabaleshwar Valley View" },
          { url: "https://images.unsplash.com/photo-1511497584788-876761c119ef?auto=format&fit=crop&w=1000&q=80", caption: "Resort Pool & Nature Trails" },
        ],
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: "Departure & Scenic Train Journey",
            description: "Overnight journey towards Maharashtra. Meet fellow travelers and enjoy interactive games arranged by our Dexplora coordinator.",
            meals: "Dinner on train",
            accommodation: "Train Journey",
          },
          {
            dayNumber: 2,
            title: "Arrival & Mahabaleshwar Resort Relaxation",
            description: "Check-in to our 3-star resort. Unwind by the swimming pool. Evening visit to Mapro Garden strawberry farm for fresh ice creams and mocktails.",
            meals: "Dinner",
            accommodation: "Mahabaleshwar Resort",
          },
          {
            dayNumber: 3,
            title: "Full Day Panchgani & Mahabaleshwar Sightseeing",
            description: "Visit Table Land in Panchgani, Sydney Point, Arthur's Seat Point, Echo Point, and Venna Lake. Sunset boat ride.",
            meals: "Breakfast & Dinner",
            accommodation: "Mahabaleshwar Resort",
          },
          {
            dayNumber: 4,
            title: "Old Mahabaleshwar Temple & Return Journey",
            description: "Visit Panchganga Temple and local souvenir markets. Board return bus/train back to your destination.",
            meals: "Breakfast",
            accommodation: "Return Transit",
          },
        ],
      },
      inclusions: {
        create: [
          { text: "Up & Down train / bus ticket" },
          { text: "3-Star Resort stay with Swimming Pool access" },
          { text: "Internal AC coach for all sightseeing points" },
          { text: "Breakfast and Dinner meals" },
          { text: "Malayali Tour Leader support" },
        ],
      },
      exclusions: {
        create: [
          { text: "Boating charges at Venna Lake" },
          { text: "Personal food items & shopping" },
        ],
      },
      batches: {
        create: [
          {
            batchName: "September Weekend Special",
            startDate: new Date("2026-09-12"),
            endDate: new Date("2026-09-15"),
            totalSeats: 35,
            bookedSeats: 30,
            availableSeats: 5,
            status: "ALMOST_FULL",
            boardingPoint: "Kochi / Palakkad / Coimbatore",
          },
          {
            batchName: "October Long Weekend",
            startDate: new Date("2026-10-02"),
            endDate: new Date("2026-10-05"),
            totalSeats: 35,
            bookedSeats: 15,
            availableSeats: 20,
            status: "OPEN",
            boardingPoint: "Kochi / Palakkad",
          },
        ],
      },
    },
  });

  // Package 3: Matheran
  const p3 = await prisma.package.upsert({
    where: { slug: "matheran-weekend-getaway" },
    update: {},
    create: {
      title: "Matheran Weekend Getaway",
      slug: "matheran-weekend-getaway",
      shortDescription: "Experience Asia's only automobile-free hill station with red soil trails, sunset lookouts, and cozy eco-resort stays.",
      fullDescription: "Tired of city pollution? Step back in time to Matheran — a tranquil hill station where no motor vehicles are allowed! Travel on foot, horseback, or hand-pulled rickshaws along red dirt paths flanked by evergreen forests. Ideal for couples, solo travelers, and bachelor groups.",
      destinationId: destMatheran.id,
      tripType: "Weekend Getaway",
      coverImage: "https://images.unsplash.com/photo-1511497584788-876761c119ef?auto=format&fit=crop&w=1200&q=80",
      duration: "3 Days / 2 Nights",
      price: 4299,
      originalPrice: 5499,
      departureLocation: "Kerala / Mumbai / Pune",
      arrivalLocation: "Neral / Matheran",
      accommodation: "Heritage Eco-Resort",
      transportation: "Train & Toy Train / Shuttle",
      guideInfo: "Malayali Coordinator",
      meals: "Breakfast Included",
      featured: true,
      popular: false,
      status: "PUBLISHED",
      displayOrder: 3,
      seoTitle: "Matheran Weekend Tour Package ₹4,299 | Dexplora",
      seoDescription: "Book Matheran eco-friendly weekend getaway package starting at ₹4,299 with Dexplora Tour Planners.",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1511497584788-876761c119ef?auto=format&fit=crop&w=1000&q=80", caption: "Matheran Forest Pathway" },
        ],
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: "Arrival at Neral & Trek / Toy Train to Matheran",
            description: "Reach Neral Station. Enjoy the memorable Toy Train ride or horseback trek up to Dasturi Naka. Check-in to forest resort.",
            meals: "Dinner",
            accommodation: "Eco-Resort Matheran",
          },
          {
            dayNumber: 2,
            title: "38 Viewpoints Exploration & Sunset Point",
            description: "Visit Louisa Point, Echo Point, Charlotte Lake, Panorama Point, and Porcupine Point for an incredible sunset over Sahyadri ranges.",
            meals: "Breakfast & Dinner",
            accommodation: "Eco-Resort Matheran",
          },
          {
            dayNumber: 3,
            title: "Morning Trek & Departure",
            description: "Early morning nature walk, local chikki shopping, and check-out for return journey back home.",
            meals: "Breakfast",
            accommodation: "Return Journey",
          },
        ],
      },
      inclusions: {
        create: [
          { text: "Train ticket assistance" },
          { text: "2 Nights accommodation in eco resort" },
          { text: "Daily breakfast and dinner" },
          { text: "Guided group walk through top points" },
        ],
      },
      exclusions: {
        create: [
          { text: "Horse riding charges" },
          { text: "Personal expenses" },
        ],
      },
      batches: {
        create: [
          {
            batchName: "September Weekend Batch",
            startDate: new Date("2026-09-25"),
            endDate: new Date("2026-09-27"),
            totalSeats: 25,
            bookedSeats: 12,
            availableSeats: 13,
            status: "OPEN",
            boardingPoint: "Kochi / Mumbai",
          },
        ],
      },
    },
  });
  console.log("✅ Packages and itineraries seeded");

  // 7. Testimonials
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      {
        customerName: "Rahul Varma & Friends",
        customerEmail: "rahul@gmail.com",
        tripName: "Kerala to Meghalaya Group Package",
        rating: 5,
        review: "Meghalaya trip with Dexplora was hands down the best journey of our lives! The Malayali tour leader Arjun made sure everyone felt like family. Dawki river boat ride was dreamlike!",
        customerPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        travelDate: "May 2026",
        status: "APPROVED",
        featured: true,
      },
      {
        customerName: "Ananya Nair",
        customerEmail: "ananya@gmail.com",
        tripName: "Mahabaleshwar Group Departure",
        rating: 5,
        review: "Traveled solo with Dexplora to Mahabaleshwar. As a solo woman traveler, safety was my biggest concern, but Dexplora team took extreme care! Resort stay and pool party were amazing.",
        customerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        travelDate: "June 2026",
        status: "APPROVED",
        featured: true,
      },
      {
        customerName: "Faisal & Family",
        customerEmail: "faisal@gmail.com",
        tripName: "Matheran Weekend Getaway",
        rating: 5,
        review: "Super budget-friendly and hassle-free organization. The food arrangements had Malayalam flavor preferences which was a great touch for our parents!",
        customerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        travelDate: "July 2026",
        status: "APPROVED",
        featured: true,
      },
    ],
  });
  console.log("✅ Testimonials created");

  // 8. Gallery Albums and Images
  const albumMeghalaya = await prisma.galleryAlbum.upsert({
    where: { slug: "meghalaya-memories" },
    update: {},
    create: {
      name: "Meghalaya Group Trip 2026",
      slug: "meghalaya-memories",
      description: "Moments captured during our Northeast adventures",
      coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    },
  });

  await prisma.galleryImage.deleteMany();
  await prisma.galleryImage.createMany({
    data: [
      {
        albumId: albumMeghalaya.id,
        destinationId: destMeghalaya.id,
        title: "Crystal Waters of Dawki",
        caption: "Floating boat on Umngot River",
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        category: "Northeast",
        featured: true,
        published: true,
      },
      {
        albumId: albumMeghalaya.id,
        destinationId: destMeghalaya.id,
        title: "Wei Sawdong Waterfall",
        caption: "Three-tier waterfall in Cherrapunji",
        url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        category: "Waterfalls",
        featured: true,
        published: true,
      },
      {
        destinationId: destMahabaleshwar.id,
        title: "Mahabaleshwar Sunset Point",
        caption: "Golden hour over Sahyadri hills",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        category: "Mountains",
        featured: true,
        published: true,
      },
      {
        destinationId: destMatheran.id,
        title: "Matheran Eco Trails",
        caption: "Shaded red soil pathways",
        url: "https://images.unsplash.com/photo-1511497584788-876761c119ef?auto=format&fit=crop&w=800&q=80",
        category: "Nature",
        featured: true,
        published: true,
      },
    ],
  });
  console.log("✅ Gallery seeded");

  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteUrl, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dexplora Tour Planners | Budget Group Trips Across India",
    template: "%s | Dexplora Tour Planners",
  },
  description:
    "Explore budget-friendly group trips, curated tour packages, and nature getaways across India with Dexplora Tour Planners.",
  keywords: [
    "Dexplora",
    "Dexplora Tour Planners",
    "Group trips India",
    "Budget tour packages",
    "Malayali tour leader",
    "Meghalaya group departure",
    "Mahabaleshwar tour",
    "Kashmir trip package",
  ],
  authors: [{ name: "Dexplora Tour Planners" }],
  icons: {
    icon: "/images/logo/logo.png",
    shortcut: "/images/logo/logo.png",
    apple: "/images/logo/logo.png",
  },
  openGraph: {
    title: "Dexplora Tour Planners | Budget Group Trips Across India",
    description:
      "Explore budget-friendly group trips, curated tour packages, and nature getaways across India with Dexplora Tour Planners.",
    url: siteUrl,
    siteName: "Dexplora Tour Planners",
    images: [
      {
        url: absoluteUrl("/images/logo/logoblack.png"),
        width: 1200,
        height: 630,
        alt: "Dexplora Tour Planners",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dexplora Tour Planners | Budget Group Trips Across India",
    description:
      "Explore budget-friendly group trips, curated tour packages, and nature getaways across India with Dexplora Tour Planners.",
    images: [absoluteUrl("/images/logo/logoblack.png")],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Dexplora Tour Planners",
    "url": siteUrl,
    "logo": absoluteUrl("/images/logo/logoblack.png"),
    "description": "Premier travel agency organizing curated budget group trips and customized holiday packages across India.",
    "telephone": "+917034267985",
    "email": "info@dexplora.in",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "MG Road",
      "addressLocality": "Kochi",
      "addressRegion": "Kerala",
      "postalCode": "682016",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://instagram.com/dexploratours",
      "https://facebook.com/dexploratours",
      "https://youtube.com/@dexploratours"
    ]
  };

  const globalWebSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Dexplora Tour Planners",
    "url": siteUrl,
  };

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#0B1026]">
        <JsonLd data={globalOrganizationSchema} />
        <JsonLd data={globalWebSiteSchema} />
        {children}
      </body>
    </html>
  );
}

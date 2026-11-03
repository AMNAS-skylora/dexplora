/**
 * Dexplora uses the native MongoDB adapter, not Prisma nested writes.
 * Store package relation-like content as real arrays in the Package document.
 * Keeping all itinerary rows also preserves newly added (as-yet blank) days.
 */
export interface ItineraryInput {
  dayNumber?: number;
  title?: string;
  description?: string;
  image?: string | null;
  imageUrl?: string | null;
  meals?: string | null;
  accommodation?: string | null;
}
export interface PackageEmbeddedInput {
  images?: Array<{ url: string; caption?: string | null }>;
  itineraries?: ItineraryInput[];
  inclusions?: Array<string | { text: string }>;
  exclusions?: Array<string | { text: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

export function buildPackageEmbeddedRelations(data: PackageEmbeddedInput) {
  return {
    images: (data.images ?? []).filter((img) => clean(img.url)).map((img, index) => ({
      url: clean(img.url),
      caption: clean(img.caption) || null,
      displayOrder: index,
    })),
    itineraries: (data.itineraries ?? []).map((day, index) => {
      const imageUrl = clean(day.imageUrl || day.image) || null;
      return {
        dayNumber: index + 1,
        title: clean(day.title) || "Day " + (index + 1),
        description: clean(day.description),
        imageUrl,
        image: imageUrl,
        meals: clean(day.meals) || null,
        accommodation: clean(day.accommodation) || null,
        displayOrder: index,
      };
    }),
    inclusions: (data.inclusions ?? []).map((inc) => ({
      text: clean(typeof inc === "string" ? inc : inc.text),
    })).filter((inc) => inc.text).map((inc, index) => ({ ...inc, displayOrder: index })),
    exclusions: (data.exclusions ?? []).map((exc) => ({
      text: clean(typeof exc === "string" ? exc : exc.text),
    })).filter((exc) => exc.text).map((exc, index) => ({ ...exc, displayOrder: index })),
    faqs: (data.faqs ?? []).filter((faq) => clean(faq.question) || clean(faq.answer))
      .map((faq, index) => ({
        question: clean(faq.question),
        answer: clean(faq.answer),
        displayOrder: index,
      })),
  };
}

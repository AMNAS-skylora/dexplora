export const PRICE_CARD_COLORS = ["green", "blue", "orange", "purple"] as const;
export const PRICE_CARD_ICONS = ["train", "couple", "person", "none"] as const;
export const PRICE_CARD_UNITS = ["per person", "per couple", "per group", "total"] as const;
export const MAX_PRICE_CARDS = 12;

export type PriceCard = {
  title: string;
  price: number;
  unit: typeof PRICE_CARD_UNITS[number];
  color: typeof PRICE_CARD_COLORS[number];
  icon: typeof PRICE_CARD_ICONS[number];
  visible: boolean;
};

export function validatePriceCards(input: unknown): { cards: PriceCard[]; error?: never } | { error: string; cards?: never } {
  if (!Array.isArray(input) || input.length > MAX_PRICE_CARDS) return { error: "Add at most " + MAX_PRICE_CARDS + " price cards." };
  const cards: PriceCard[] = [];
  for (const [index, item] of input.entries()) {
    const row = index + 1;
    if (!item || typeof item !== "object") return { error: "Invalid price card " + row + "." };
    const { title, price, unit, color, icon, visible } = item;
    if (typeof title !== "string" || !title.trim() || title.trim().length > 100) return { error: "Enter a title of 1–100 characters for price card " + row + "." };
    if (typeof price !== "number" || !Number.isSafeInteger(price) || price < 1 || price > 99999999) return { error: "Enter a valid whole rupee amount for price card " + row + "." };
    if (!PRICE_CARD_UNITS.includes(unit) || !PRICE_CARD_COLORS.includes(color) || !PRICE_CARD_ICONS.includes(icon) || typeof visible !== "boolean") return { error: "Choose valid settings for price card " + row + "." };
    cards.push({ title: title.trim(), price, unit, color, icon, visible });
  }
  return { cards };
}

export function getVisiblePriceCards(input: unknown): PriceCard[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, MAX_PRICE_CARDS).flatMap(item => {
    const result = validatePriceCards([item]);
    return result.cards?.[0]?.visible ? result.cards : [];
  });
}

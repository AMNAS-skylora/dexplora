/** Dexplora cancellation and refund policy. Stored as plain text and rendered safely. */
export const DEFAULT_CANCELLATION_CHARGES = [
  "30 days or more before departure|10",
  "15–29 days before departure|25",
  "7–14 days before departure|50",
  "Within 7 days of departure|100",
  "No-show / Failure to join|100",
].join("\n");

export const DEFAULT_CANCELLATION_NOTES =
  "Cancellation charges are calculated based on the total package cost per person.";

export const DEFAULT_IMPORTANT_NOTICE =
  "Tour schedules, travel arrangements and inclusions are subject to the package details confirmed at booking. Contact Dexplora for assistance before making a payment.";

export interface CancellationPolicy {
  advancePercent: number;
  advanceNonRefundable: boolean;
  charges: Array<{ period: string; percentage: number }>;
  cancellationNotes: string;
  importantNotice: string;
}

export interface CancellationSettingsSource {
  booking_advance_percent?: string;
  cancellation_charges?: string;
  cancellation_notes?: string;
  important_notice?: string;
}

export interface PackageCancellationOverrides {
  bookingAdvancePercentOverride?: number | null;
  cancellationChargesOverride?: string | null;
  cancellationNotesOverride?: string | null;
  importantNoticeOverride?: string | null;
}

/** A line is "Cancellation period|percentage". No HTML is accepted or rendered. */
export function parseCancellationCharges(value: string): CancellationPolicy["charges"] {
  const lines = value.replace(/\r/g, "").split("\n").map(s => s.trim()).filter(Boolean);
  if (!lines.length || lines.length > 20) throw new Error("Enter between 1 and 20 cancellation periods.");
  return lines.map((line, index) => {
    const delimiter = line.lastIndexOf("|");
    if (delimiter < 1) throw new Error(\`Row \${index + 1} must use Period|Percentage.\`);
    const period = line.slice(0, delimiter).trim();
    const percentString = line.slice(delimiter + 1).trim().replace(/%$/, "");
    const percentage = Number(percentString);
    if (!period || period.length > 180 || !percentString || !Number.isFinite(percentage)
      || percentage < 0 || percentage > 100) {
      throw new Error(\`Row \${index + 1} has an invalid period or charge (0–100%).\`);
    }
    return { period, percentage };
  });
}

export function validateCancellationSettings(settings: CancellationSettingsSource): void {
  if (settings.booking_advance_percent !== undefined) {
    const str = String(settings.booking_advance_percent).trim();
    const percent = Number(str);
    if (!str || !Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new Error("Booking advance must be between 0 and 100%.");
    }
  }
  if (settings.cancellation_charges !== undefined) {
    parseCancellationCharges(settings.cancellation_charges);
  }
  if (settings.cancellation_notes !== undefined && settings.cancellation_notes.length > 2000) {
    throw new Error("Cancellation notes must be 2,000 characters or less.");
  }
  if (settings.important_notice !== undefined && settings.important_notice.length > 3000) {
    throw new Error("Important notice must be 3,000 characters or less.");
  }
}

/** Overrides are optional: blank/null means use the global website policy. */
export function resolveCancellationPolicy(
  settings: CancellationSettingsSource,
  pkg: PackageCancellationOverrides = {},
): CancellationPolicy {
  const advance = pkg.bookingAdvancePercentOverride == null
    ? Number(settings.booking_advance_percent ?? 30)
    : Number(pkg.bookingAdvancePercentOverride);
  let charges;
  try {
    charges = parseCancellationCharges(
      pkg.cancellationChargesOverride?.trim() || settings.cancellation_charges || DEFAULT_CANCELLATION_CHARGES,
    );
  } catch {
    charges = parseCancellationCharges(DEFAULT_CANCELLATION_CHARGES);
  }
  return {
    advancePercent: Number.isFinite(advance) && advance >= 0 && advance <= 100 ? advance : 30,
    advanceNonRefundable: true,
    charges,
    cancellationNotes: pkg.cancellationNotesOverride?.trim() || settings.cancellation_notes?.trim() || DEFAULT_CANCELLATION_NOTES,
    importantNotice: pkg.importantNoticeOverride?.trim() || settings.important_notice?.trim() || DEFAULT_IMPORTANT_NOTICE,
  };
}

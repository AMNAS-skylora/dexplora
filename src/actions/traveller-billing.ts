"use server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { calculateTravellerBill, type BookingExtraCharge } from "@/lib/traveller-billing";

export async function saveTravellerBilling(bookingId: string, input: {
  packageComplimentary: boolean;
  packagePriceOverride?: number;
  extraCharges: BookingExtraCharge[];
}) {
  if (!(await getAdminSession())) return { error: "Unauthorized" };
  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { error: "Booking not found" };
    const batch = await db.tripBatch.findUnique({ where: { id: booking.tripBatchId }, include: { package: true } });
    if (!batch) return { error: "Trip not found" };
    const price = (Number(batch.priceOverride) || Number(batch.package?.price) || 0) * (booking.travellerCount || 1);
    const history = Array.isArray(booking.payments) ? booking.payments : [];
    const paid = Math.max(Number(booking.paidAmount) || 0, history.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0));
    const bill = calculateTravellerBill({
      eventPackagePrice: price,
      packageComplimentary: input.packageComplimentary,
      packagePriceOverride: input.packagePriceOverride,
      extraCharges: input.extraCharges,
      payments: [{ id: "existing", amount: paid }],
    });
    await db.booking.update({ where: { id: bookingId }, data: {
      packageComplimentary: input.packageComplimentary,
      packagePriceOverride: input.packagePriceOverride ?? null,
      extraCharges: bill.extras,
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount,
      balanceAmount: bill.balanceAmount,
      paymentStatus: bill.totalAmount === 0 || bill.balanceAmount === 0 ? "Paid" : bill.paidAmount > 0 ? "Partially Paid" : "Pending",
    } });
    revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}`);
    revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}/customers/${bookingId}`);
    return { success: true, bill };
  } catch (e: any) {
    return { error: e?.message || "Unable to save billing" };
  }
}

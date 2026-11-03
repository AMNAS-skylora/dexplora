"use server";

import { ObjectId } from "mongodb";
import { getDb, db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  calculateBookingBilling,
  type TravellerBillingRow,
} from "@/lib/traveller-billing";

/** Admin-only billing adjustment for new and existing individual travellers. */
export async function saveTravellerBilling(bookingId: string, rows: TravellerBillingRow[]) {
  const session = await getAdminSession();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    return { error: "Only an administrator may adjust traveller charges." };
  }
  try {
    if (!ObjectId.isValid(bookingId)) return { error: "Invalid booking ID." };
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { error: "Booking not found." };
    if (!Array.isArray(rows)) return { error: "Traveller billing rows are missing." };

    const history = Array.isArray(booking.payments) ? booking.payments : [];
    const recordedPaid = history.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const paidAmount = Math.max(recordedPaid, Number(booking.paidAmount) || 0);

    const bill = calculateBookingBilling({
      rows, travellerCount: Number(booking.travellerCount) || 1, paidAmount,
    });

    // Never edit or delete payment history. An overpayment becomes a refundable
    // credit instead of preventing a complimentary adjustment on an old booking.
    const bookingCollection = getDb().collection("Booking");
    const previousPaid = booking.paidAmount;
    const updated = await bookingCollection.findOneAndUpdate(
      {
        _id: new ObjectId(bookingId),
        paidAmount: previousPaid === undefined ? { $exists: false } : previousPaid,
        travellerCount: booking.travellerCount,
      },
      {
        $set: {
          billingRows: bill.rows,
          billingVersion: 1,
          totalAmount: bill.totalAmount,
          paidAmount: bill.paidAmount,
          balanceAmount: bill.balanceAmount,
          creditAmount: bill.creditAmount,
          paymentStatus: bill.paymentStatus,
          updatedAt: new Date(),
        },
        $inc: { billingRevision: 1 },
      },
      { returnDocument: "after" }
    );
    if (!updated) {
      return { error: "Booking or payments changed while editing. Reload and check the latest amounts before saving." };
    }

    try {
      await getDb().collection("TravellerBillingAudit").insertOne({
        bookingId, tripBatchId: booking.tripBatchId,
        actorId: session.userId,
        actorEmail: session.email,
        beforeTotal: Number(booking.totalAmount || 0),
        afterTotal: bill.totalAmount,
        previousRows: Array.isArray(booking.billingRows) ? booking.billingRows : null,
        updatedRows: bill.rows,
        paidAmount: bill.paidAmount,
        creditAmount: bill.creditAmount,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Billing audit insertion failed:", error);
    }
    revalidatePath("/admin/upcoming-trips");
    revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}`);
    revalidatePath(`/admin/upcoming-trips/${booking.tripBatchId}/customers/${bookingId}`);
    return { success: true, bill };
  } catch (error: unknown) {
    console.error("Billing save failed:", error);
    return { error: error instanceof Error ? error.message : "Could not save traveller billing." };
  }
}

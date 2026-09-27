import { db } from "@/lib/db";
import { ExpensesManagerClient } from "./ExpensesManagerClient";

export const revalidate = 0;

export default async function ExpensesPage() {
  const [packages, batches, expenses] = await Promise.all([
    db.package.findMany({ orderBy: { createdAt: "desc" } }),
    db.tripBatch.findMany({
      include: { package: true, bookings: true },
      orderBy: { startDate: "desc" },
    }),
    db.expense.findMany({ orderBy: { expenseDate: "desc" } }),
  ]);

  const packageRows = (packages || []).map((pkg: any) => ({
    id: pkg.id,
    title: pkg.title,
    price: Number(pkg.price) || 0,
    expensePerPerson: Number(pkg.expensePerPerson) || 0,
    status: pkg.status || "DRAFT",
  }));

  const eventRows = (batches || []).map((batch: any) => {
    const bookings = Array.isArray(batch.bookings) ? batch.bookings : [];
    const activeBookings = bookings.filter((b: any) => {
      const s = String(b.bookingStatus || b.status || "").toUpperCase();
      return s !== "CANCELLED";
    });
    const travellerCount = activeBookings.reduce((sum: number, b: any) => sum + (Number(b.travellerCount) || 1), 0);
    const revenue = activeBookings.reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || 0), 0);
    const expensePerPerson = Number(batch.package?.expensePerPerson) || 0;
    const baseExpense = expensePerPerson * travellerCount;
    const extraExpenses = (expenses || []).filter((e: any) => e.tripBatchId === batch.id);
    const extraExpense = extraExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

    return {
      id: batch.id,
      packageId: batch.packageId,
      packageTitle: batch.package?.title || "Package",
      batchName: batch.batchName || "Standard Batch",
      startDate: batch.startDate,
      endDate: batch.endDate,
      travellerCount,
      revenue,
      expensePerPerson,
      baseExpense,
      extraExpense,
      totalExpense: baseExpense + extraExpense,
      profit: revenue - (baseExpense + extraExpense),
    };
  });

  const generalExpenses = (expenses || []).filter((e: any) => !e.tripBatchId);
  const totals = {
    revenue: eventRows.reduce((sum: number, e: any) => sum + e.revenue, 0),
    baseExpense: eventRows.reduce((sum: number, e: any) => sum + e.baseExpense, 0),
    eventExtraExpense: eventRows.reduce((sum: number, e: any) => sum + e.extraExpense, 0),
    generalExpense: generalExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0),
  };

  return (
    <ExpensesManagerClient
      packages={packageRows}
      events={eventRows}
      expenses={(expenses || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount) || 0,
        category: e.category || "Miscellaneous",
        tripBatchId: e.tripBatchId || null,
        packageId: e.packageId || null,
        expenseDate: e.expenseDate,
        notes: e.notes || null,
      }))}
      totals={totals}
    />
  );
}

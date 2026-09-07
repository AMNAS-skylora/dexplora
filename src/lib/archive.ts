import { formatDate, formatPrice } from "@/lib/utils";

export interface ArchiveMetrics {
  isPastEvent: boolean;
  eventEndDate: Date;
  archiveExpiresAt: Date;
  daysRemaining: number;
  urgencyLevel: "NORMAL" | "STRONG" | "URGENT" | "EXPIRED";
  statusText: string;
}

export function calculateArchiveMetrics(
  endDateInput: Date | string | number | undefined,
  retentionDays: number = 30
): ArchiveMetrics {
  const now = new Date();
  const eventEndDate = endDateInput ? new Date(endDateInput) : new Date();

  const isPastEvent = now.getTime() > eventEndDate.getTime();

  // Add retention days (default 30)
  const archiveExpiresAt = new Date(eventEndDate);
  archiveExpiresAt.setDate(archiveExpiresAt.getDate() + Math.max(1, retentionDays));

  const diffMs = archiveExpiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let urgencyLevel: "NORMAL" | "STRONG" | "URGENT" | "EXPIRED" = "NORMAL";
  let statusText = `${daysRemaining} days remaining`;

  if (daysRemaining <= 0) {
    urgencyLevel = "EXPIRED";
    statusText = "Deletes today / Expired";
  } else if (daysRemaining <= 6) {
    urgencyLevel = "URGENT";
    statusText = `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining`;
  } else if (daysRemaining <= 14) {
    urgencyLevel = "STRONG";
    statusText = `${daysRemaining} days remaining`;
  } else {
    urgencyLevel = "NORMAL";
    statusText = `${daysRemaining} days remaining`;
  }

  return {
    isPastEvent,
    eventEndDate,
    archiveExpiresAt,
    daysRemaining,
    urgencyLevel,
    statusText,
  };
}

export async function generateBatchBookingsExcel(
  batch: any,
  bookings: any[],
  packageData: any
): Promise<{ buffer: Buffer; filename: string }> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dexplora Tour Planners";
  workbook.lastModifiedBy = "Admin System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Booking Manifest");

  const pkgTitle = packageData?.title || batch?.packageTitle || "Tour Package";
  const startDateStr = batch?.startDate ? formatDate(batch.startDate) : "N/A";
  const endDateStr = batch?.endDate ? formatDate(batch.endDate) : "N/A";

  // Sanitize filename slug
  const safeSlug = (pkgTitle || "package")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const dateSlug = batch?.startDate
    ? new Date(batch.startDate).toISOString().split("T")[0]
    : "departure";

  const filename = `dexplora-${safeSlug}-${dateSlug}-bookings.xlsx`;

  // Header styling & title
  worksheet.mergeCells("A1:P1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = `DEXPLORA TOUR PLANNERS - BOOKING MANIFEST ARCHIVE`;
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF050A24" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 35;

  // Event Details Header Info
  worksheet.mergeCells("A2:P2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `Package: ${pkgTitle} | Departure: ${startDateStr} - ${endDateStr} | Total Bookings: ${bookings.length} | Export Date: ${formatDate(new Date())}`;
  subTitleCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF3478F6" } };
  subTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 24;

  // Empty Spacer Row
  worksheet.getRow(3).height = 10;

  // Table Headers
  const headers = [
    "Ref Code",
    "Customer Name",
    "Phone",
    "WhatsApp",
    "Email",
    "Gender / Age",
    "Travellers",
    "Boarding Point",
    "Transport / Seat",
    "Total Amount (₹)",
    "Paid Amount (₹)",
    "Balance Due (₹)",
    "Payment Status",
    "Booking Status",
    "Emergency Contact",
    "Notes & Custom Fields",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3478F6" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE8ECF3" } },
      bottom: { style: "medium", color: { argb: "FF0B1026" } },
      left: { style: "thin", color: { argb: "FFE8ECF3" } },
      right: { style: "thin", color: { argb: "FFE8ECF3" } },
    };
  });

  let sumTravellers = 0;
  let sumTotal = 0;
  let sumPaid = 0;
  let sumBalance = 0;

  // Populate Data Rows
  bookings.forEach((b: any, idx: number) => {
    const travellers = Number(b.travellerCount || b.numberOfTravellers || 1);
    const totalAmt = Number(b.totalAmount || 0);
    const paidAmt = Number(b.paidAmount || b.advanceAmount || 0);
    const balanceAmt = Number(b.balanceAmount || Math.max(0, totalAmt - paidAmt));

    sumTravellers += travellers;
    sumTotal += totalAmt;
    sumPaid += paidAmt;
    sumBalance += balanceAmt;

    const rowValues = [
      b.bookingRef || b.referenceCode || `DEX-${idx + 1001}`,
      b.customerName || b.fullName || "Guest",
      b.phone || "N/A",
      b.whatsappNumber || b.phone || "N/A",
      b.email || "N/A",
      `${b.gender || "N/A"} / ${b.age || "N/A"}`,
      travellers,
      b.boardingPoint || b.boardingLocation || b.pickupLocation || "Kerala",
      b.seatNumber ? `${b.transportType || "Seat"}: ${b.seatNumber}` : b.transportType || "Standard",
      totalAmt,
      paidAmt,
      balanceAmt,
      (b.paymentStatus || "PENDING").toUpperCase(),
      (b.bookingStatus || b.status || "CONFIRMED").toUpperCase(),
      b.emergencyName ? `${b.emergencyName} (${b.emergencyPhone || "N/A"})` : "N/A",
      b.notes || "None",
    ];

    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 22;

    const isEven = idx % 2 === 0;
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 9 };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" },
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Currency formatting for amounts
      if ([10, 11, 12].includes(colNumber)) {
        cell.numFmt = '"₹"#,##0';
        cell.alignment = { horizontal: "right", vertical: "middle" };
      } else if (colNumber === 7) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  });

  // Total Summary Footer Row
  const summaryRow = worksheet.addRow([
    "TOTALS",
    "",
    "",
    "",
    "",
    "",
    sumTravellers,
    "",
    "",
    sumTotal,
    sumPaid,
    sumBalance,
    "",
    "",
    "",
    "",
  ]);

  summaryRow.height = 25;
  summaryRow.eachCell((cell, colNumber) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0B1026" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0B1026" } },
      bottom: { style: "double", color: { argb: "FF0B1026" } },
    };

    if ([10, 11, 12].includes(colNumber)) {
      cell.numFmt = '"₹"#,##0';
      cell.alignment = { horizontal: "right", vertical: "middle" };
    } else if (colNumber === 7) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  });

  // Set explicit column widths
  const colWidths = [16, 22, 16, 16, 24, 15, 12, 18, 18, 16, 16, 16, 16, 16, 22, 28];
  worksheet.columns.forEach((col, idx) => {
    col.width = colWidths[idx] || 18;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    buffer,
    filename,
  };
}

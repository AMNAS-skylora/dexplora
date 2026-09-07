import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateBatchBookingsExcel } from "@/lib/archive";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { batchId } = await params;
    if (!batchId) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
    }

    // Fetch batch & associated bookings
    const batch = await db.tripBatch.findUnique({
      where: { id: batchId },
      include: { package: true, bookings: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "Trip batch not found" }, { status: 404 });
    }

    const bookings = Array.isArray(batch.bookings) ? batch.bookings : [];
    if (bookings.length === 0) {
      return NextResponse.json(
        { error: "No booking records available for this event to export." },
        { status: 400 }
      );
    }

    // Generate Excel file
    const { buffer, filename } = await generateBatchBookingsExcel(
      batch,
      bookings,
      batch.package
    );

    // Record audit log entry for export
    try {
      await db.archiveAuditLog.create({
        data: {
          batchId: batch.id,
          packageTitle: batch.package?.title || batch.packageTitle || "Unknown Package",
          startDate: batch.startDate,
          endDate: batch.endDate,
          recordCount: bookings.length,
          exportedAt: new Date(),
          exportedBy: session.email || "Admin",
          status: "EXPORTED",
        },
      });
    } catch (auditErr) {
      console.warn("Failed to write archive audit log:", auditErr);
    }

    // Return binary Excel response
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Excel Export Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate Excel export" },
      { status: 500 }
    );
  }
}

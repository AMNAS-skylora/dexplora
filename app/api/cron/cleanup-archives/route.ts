import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  try {
    // Auth Check: Cron secret or Admin session
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const headerSecret = req.headers.get("x-cron-secret");

    const isSecretValid =
      cronSecret &&
      ((authHeader && authHeader === `Bearer ${cronSecret}`) ||
        headerSecret === cronSecret);

    const session = await getAdminSession();
    if (!isSecretValid && !session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Check Settings
    const settings = await getSiteSettings();
    const autoCleanupEnabled = settings.booking_auto_cleanup_enabled === "true";
    const retentionDays = Math.max(1, parseInt(settings.booking_retention_days || "30", 10));

    if (!autoCleanupEnabled && !session) {
      return NextResponse.json({
        success: true,
        message: "Auto-cleanup is currently disabled in site settings.",
        deletedCount: 0,
      });
    }

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Find completed batches whose endDate is older than cutoffDate
    const expiredBatches = await db.tripBatch.findMany({
      where: {
        endDate: { lte: cutoffDate },
      },
      include: { bookings: true, package: true },
    });

    let totalDeleted = 0;
    let batchesProcessed = 0;

    for (const batch of expiredBatches) {
      const bookings = Array.isArray(batch.bookings) ? batch.bookings : [];
      if (bookings.length === 0) continue;

      // Delete only booking records for this batch
      const deleteResult = await db.booking.deleteMany({
        where: { tripBatchId: batch.id },
      });

      // Also check bookingEnquiry table for any linked enquiries
      await db.bookingEnquiry.deleteMany({
        where: { tripBatchId: batch.id },
      });

      const deletedCount = deleteResult.count || bookings.length;
      totalDeleted += deletedCount;
      batchesProcessed++;

      // Write Audit Log
      try {
        await db.archiveAuditLog.create({
          data: {
            batchId: batch.id,
            packageTitle: batch.package?.title || batch.packageTitle || "Unknown Package",
            startDate: batch.startDate,
            endDate: batch.endDate,
            recordCount: deletedCount,
            deletedAt: new Date(),
            exportedBy: session ? session.email : "Vercel Cron Auto Cleanup",
            status: "AUTO_CLEANED",
          },
        });
      } catch (logErr) {
        console.warn("Cron log write error:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${batchesProcessed} expired events and cleaned up ${totalDeleted} booking records.`,
      batchesProcessed,
      totalDeletedBookings: totalDeleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron Archive Cleanup Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute auto cleanup job" },
      { status: 500 }
    );
  }
}

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { updateReviewStatus } from "@/actions";
import {
  Package,
  Calendar,
  BookmarkCheck,
  Mail,
  MessageSquare,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
} from "lucide-react";


export const revalidate = 0; // Always fresh in admin

export default async function AdminDashboardPage() {
  const [
    totalPackages,
    publishedPackages,
    totalUpcomingTrips,
    totalBookings,
    newBookingsCount,
    totalEnquiries,
    pendingReviewsCount,
    totalGalleryImages,
    totalDestinations,
    recentBookings,
    recentEnquiries,
    pendingReviews,
  ] = await Promise.all([
    db.package.count(),
    db.package.count({ where: { status: "PUBLISHED" } }),
    db.tripBatch.count({ where: { startDate: { gte: new Date() } } }),
    db.bookingEnquiry.count(),
    db.bookingEnquiry.count({ where: { status: "NEW" } }),
    db.contactEnquiry.count(),
    db.testimonial.count({ where: { status: "PENDING" } }),
    db.galleryImage.count(),
    db.destination.count(),
    db.bookingEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { package: true },
    }),
    db.contactEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.testimonial.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const statCards = [
    { label: "Total Packages", value: totalPackages, sub: `${publishedPackages} Published`, icon: Package, href: "/admin/packages" },
    { label: "Upcoming Trips", value: totalUpcomingTrips, sub: "Active Departures", icon: Calendar, href: "/admin/upcoming-trips" },
    { label: "Bookings", value: totalBookings, sub: `${newBookingsCount} New`, icon: BookmarkCheck, href: "/admin/bookings" },
    { label: "Contact Enquiries", value: totalEnquiries, sub: "Customer Messages", icon: Mail, href: "/admin/enquiries" },
    { label: "Pending Reviews", value: pendingReviewsCount, sub: "Needs Moderation", icon: MessageSquare, href: "/admin/testimonials" },
    { label: "Gallery Photos", value: totalGalleryImages, sub: "Published Photos", icon: ImageIcon, href: "/admin/gallery" },
    { label: "Destinations", value: totalDestinations, sub: "Active Locations", icon: MapPin, href: "/admin/destinations" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Admin Overview Dashboard</h1>
        <p className="text-xs text-[#667085]">Real-time database statistics and pending action items.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="bg-white rounded-2xl p-5 border border-[#E8ECF3] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{s.label}</span>
                <div className="text-3xl font-black text-[#0B1026] group-hover:text-[#3478F6] transition-colors">
                  {s.value}
                </div>
                <span className="text-[11px] text-[#3478F6] font-semibold block">{s.sub}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F3F7FF] text-[#3478F6] flex items-center justify-center shrink-0 group-hover:bg-[#3478F6] group-hover:text-white transition-colors">
                <IconComp className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Moderation Reviews Section */}
      {pendingReviews.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="w-5 h-5" />
              <h2 className="font-extrabold text-base">Pending Reviews Needing Approval ({pendingReviews.length})</h2>
            </div>
            <Link href="/admin/testimonials" className="text-xs font-bold text-[#3478F6] hover:underline">
              View All Testimonials
            </Link>
          </div>

          <div className="space-y-3">
            {pendingReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0B1026]">{rev.customerName}</span>
                    <span className="text-[11px] text-[#3478F6] font-medium">({rev.tripName})</span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{rev.rating}/5</span>
                    </span>

                  </div>
                  <p className="text-xs text-[#667085] italic">&ldquo;{rev.review}&rdquo;</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <form action={async () => { "use server"; await updateReviewStatus(rev.id, "APPROVED", true); }}>
                    <button
                      type="submit"
                      className="bg-[#16A36A] hover:bg-[#128856] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 min-h-[36px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </form>

                  <form action={async () => { "use server"; await updateReviewStatus(rev.id, "REJECTED"); }}>
                    <button
                      type="submit"
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-[#0B1026]">Recent Booking Enquiries</h2>
          <Link href="/admin/bookings" className="text-xs font-bold text-[#3478F6] hover:underline">
            View All Bookings
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECF3] text-gray-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Ref Code</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Package</th>
                  <th className="pb-3">Travelers</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F3F7FF]">
                    <td className="py-3 font-bold text-[#3478F6]">{b.referenceCode}</td>
                    <td className="py-3 font-semibold text-[#0B1026]">{b.fullName}</td>
                    <td className="py-3 text-gray-600">{b.phone}</td>
                    <td className="py-3 text-[#0B1026] font-medium">{b.package.title}</td>
                    <td className="py-3 font-bold text-[#0B1026]">{b.numberOfTravellers}</td>
                    <td className="py-3 text-gray-500">{formatDate(b.createdAt)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "NEW"
                            ? "bg-blue-100 text-blue-700"
                            : b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">No bookings submitted yet.</p>
        )}
      </div>
    </div>
  );
}

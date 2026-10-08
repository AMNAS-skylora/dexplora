"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateBookingStatus, type BookingStatus } from "@/actions";

const BOOKING_STATUSES: BookingStatus[] = [
  "NEW",
  "READ",
  "CONTACTED",
  "CONFIRMED",
  "CANCELLED",
];

type BookingStatusSelectProps = {
  id: string;
  status: BookingStatus;
  className?: string;
};

export function BookingStatusSelect({
  id,
  status,
  className,
}: BookingStatusSelectProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as BookingStatus;
    const previousStatus = selectedStatus;

    setSelectedStatus(nextStatus);

    startTransition(async () => {
      const result = await updateBookingStatus(id, nextStatus);

      if (result?.error) {
        setSelectedStatus(previousStatus);
        alert(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <select
      name="status"
      value={selectedStatus}
      onChange={handleChange}
      disabled={isPending}
      aria-label="Update booking status"
      className={className}
    >
      {BOOKING_STATUSES.map((bookingStatus) => (
        <option key={bookingStatus} value={bookingStatus}>
          {bookingStatus}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateContactStatus, type ContactStatus } from "@/actions";

const CONTACT_STATUSES: ContactStatus[] = [
  "NEW",
  "READ",
  "REPLIED",
  "RESOLVED",
  "SPAM",
];

type ContactStatusSelectProps = {
  id: string;
  status: ContactStatus;
  className?: string;
};

export function ContactStatusSelect({
  id,
  status,
  className,
}: ContactStatusSelectProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ContactStatus>(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as ContactStatus;
    const previousStatus = selectedStatus;

    setSelectedStatus(nextStatus);

    startTransition(async () => {
      const result = await updateContactStatus(id, nextStatus);

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
      aria-label="Update contact enquiry status"
      className={className}
    >
      {CONTACT_STATUSES.map((contactStatus) => (
        <option key={contactStatus} value={contactStatus}>
          {contactStatus}
        </option>
      ))}
    </select>
  );
}

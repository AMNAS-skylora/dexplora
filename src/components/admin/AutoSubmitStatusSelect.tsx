"use client";

type AutoSubmitStatusSelectProps = {
  kind: "booking" | "contact";
  defaultValue: string;
  className?: string;
};

const STATUS_OPTIONS = {
  booking: ["NEW", "READ", "CONTACTED", "CONFIRMED", "CANCELLED"],
  contact: ["NEW", "READ", "REPLIED", "RESOLVED", "SPAM"],
} as const;

/**
 * A small client boundary for automatically submitting its parent
 * Server Action form when the selected status changes.
 */
export function AutoSubmitStatusSelect({
  kind,
  defaultValue,
  className,
}: AutoSubmitStatusSelectProps) {
  return (
    <select
      name="status"
      defaultValue={defaultValue}
      className={className}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {STATUS_OPTIONS[kind].map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

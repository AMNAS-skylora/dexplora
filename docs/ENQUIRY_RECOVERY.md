# Contact enquiry recovery and verification

The old deleteContact action used MongoDB deleteOne. An already hard-deleted document cannot be restored by the new Trash view. If a backup or point-in-time restore exists, restore it to a separate database, locate the exact missing ContactEnquiry by customer/date, verify it against the live collection, and reinsert only the missing record with its original ID and deletedAt set to null. Do not overwrite the live database or create invented enquiries. Production database access is required.

New deletes atomically set deletedAt and deletedBy, and restore clears both; the original status and message remain intact. Existing documents without deletedAt are active. There is no automatic purge.

Manual verification on staging with an authenticated admin:
1. Submit a valid contact form and confirm it appears as NEW in the inbox. Invalid data should be rejected; database errors must not appear as success.
2. Search by customer, phone, subject and message. Open a result and verify the full multiline message and contact details on mobile and desktop.
3. Set READ then REPLIED and refresh. Verify the status persists.
4. Compose an editable reply and verify the WhatsApp target and encoded message; verify SMS, call and email links on supported devices. Do not send test messages to real customers.
5. Move a test enquiry to Trash, refresh, and confirm it is excluded from inbox/dashboard count. Restore and check the original ID, content and status.
6. Confirm unauthorized access cannot read or mutate enquiries. Check the database unavailable state shows an error rather than an empty inbox.
7. Run npx tsc --noEmit and npm run build before deploying.

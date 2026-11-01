# Dexplora WhatsApp Cloud API — integration setup

This branch contains the WhatsApp template sender, recipient eligibility/consent filtering, and reminder schedule helpers. **No live send, webhook, job runner, admin UI, or Vercel deployment has been enabled.**

## Meta prerequisites
1. Create/verify Meta Business Portfolio, WhatsApp Business Account and Cloud API phone number.
2. Create and get approval for utility templates: booking confirmation, payment receipt, pending balance, travel updates. Free-form business-initiated broadcasts are not generally permitted outside the customer service window.
3. Obtain a long-lived system user access token with WhatsApp permissions. Never put tokens in NEXT_PUBLIC variables.
4. Set server-only Vercel environment variables `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`.
5. Collect and record explicit WhatsApp opt-in, plus opt-out, per recipient before sending.
6. Add a protected webhook for delivery status and inbound messages, a persistent queue with retries/rate limiting, deduplication per campaign/booking, audit logs and admin approval.
7. For scheduled reminders, persist reminder rules and run an authenticated cron with idempotency and timezone awareness. Only send to bookings with outstanding balance at execution time.
8. Test in Meta's test environment and verify template names/languages/parameter order before production.

Manual send and scheduled reminders must be separately enabled; sending is **not** activated by merging this branch.

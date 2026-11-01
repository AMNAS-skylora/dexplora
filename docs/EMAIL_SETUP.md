# Dexplora Email Notifications

This branch introduces a premium responsive Dexplora-branded HTML email template, Resend HTTP API sender and authenticated trip-wide campaign action. The existing logo at `public/images/logo/logoblack.png` is referenced through the configured public site URL.

## Environment variables
- `RESEND_API_KEY`: private Resend API key (never expose to browser or commit).
- `DEXPLORA_EMAIL_FROM`: verified sender, e.g. `Dexplora <updates@your-verified-domain.com>`.
- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS site URL hosting the Dexplora logo.

## Required before live use
1. Verify your sending domain and SPF/DKIM records with the email provider.
2. Set up an admin-only campaign UI, preview and confirmation step; do not expose the server action directly to public visitors.
3. Add unsubscribe handling for non-transactional email, bounce/suppression lists, provider webhooks and retry queues.
4. For **automatic** booking/payment emails, wire the sender to successful persisted booking/payment transactions using a durable outbox and idempotency. For **scheduled** balance reminders, configure a protected cron, persistent rules, opt-outs, and de-duplication.
5. Run a build, test with verified sender and recipient, and inspect rendering across Gmail, Outlook and iOS Mail.

CSS animation is progressive enhancement only: many email clients strip it, so the design must work without animation.

**Not yet wired:** automatic event triggers, scheduled emails, admin UI, deployment. No live emails are sent by adding these files.

# Dexplora — Gmail App Password email setup

This project uses Google's Gmail SMTP service directly over TLS port 465. It does **not** need a third-party email API key or Nodemailer. The sender uses Node's built-in TLS support.

## Required Vercel variables

Set these in **Vercel Project → Settings → Environment Variables** (Production), then redeploy:

```dotenv
SMTP_USER=your-gmail-account@gmail.com
SMTP_APP_PASSWORD=your-16-character-google-app-password
SMTP_FROM=your-gmail-account@gmail.com
NEXT_PUBLIC_SITE_URL=https://your-live-domain.com
EMAIL_AUTOMATION_ENABLED=false
```

`SMTP_FROM` must be the same Gmail address as `SMTP_USER` to avoid sender mismatch. The SMTP_HOST and SMTP_PORT variables are unnecessary; the sender is deliberately fixed to smtp.gmail.com:465.

## Generate the Google App Password

1. Sign in to the Gmail account used to send Dexplora messages.
2. Turn on Google Account **2-Step Verification**.
3. Open https://myaccount.google.com/apppasswords (available only for eligible accounts).
4. Create an App Password named **Dexplora**.
5. Paste it **only** as the server-side Vercel value of `SMTP_APP_PASSWORD`. Do not copy it into GitHub, your public UI, logs, or chat.
6. Redeploy.

Dexplora **cannot generate a Google App Password itself**. Google is the credential issuer. Never use your normal Google login password here.

## Test SMTP

Open **Admin → Email Notifications → Send test to my admin email**. Only ADMIN or SUPER_ADMIN can send this test, and it always goes to the logged-in admin's email. The admin page never shows the App Password, only whether both SMTP variables are set.

A successful test means Gmail accepted the SMTP transaction. Inbox delivery or spam placement is not guaranteed. Gmail sending limits, Google account eligibility, and hosting environment outbound TLS may apply.

## Automatic booking and payment messages

Booking confirmation and payment receipt hooks are included in the admin booking/payment save flow. They only attempt to send when **EMAIL_AUTOMATION_ENABLED=true** and Gmail SMTP is configured. Start with `false` and verify an admin test before enabling. Emails are skipped when a booking has no valid email address or its `emailOptOut` is set to true. Each SMTP attempt is logged in MongoDB `EmailDeliveryLogs`; failures do not reverse the saved booking or payment.

**Limitations:** There is no scheduled balance-reminder job or durable retry queue yet. SMTP accepted status does not confirm inbox delivery. The admin test can run while automation is disabled.

The feature branch's manual campaign action also uses Gmail SMTP, but that action has not been released into the production admin UI. Do not describe mass campaigns or scheduled reminders as active.

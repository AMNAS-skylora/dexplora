# WhatsApp Cloud API Testing Guide

This project uses Next.js App Router API routes for WhatsApp Cloud API testing.

## Added routes

```txt
GET  /api/whatsapp/webhook
POST /api/whatsapp/webhook
POST /api/whatsapp/test-send
POST /api/whatsapp/test-button
```

## Environment variables

Add these values in `.env.local` for local testing and in Vercel environment variables for deployed testing.

```env
WHATSAPP_ACCESS_TOKEN=your_meta_cloud_api_access_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_VERIFY_TOKEN=mytravel_verify_123
WHATSAPP_TEST_API_KEY=change_this_secret_key
WHATSAPP_GRAPH_VERSION=v24.0
WHATSAPP_AUTO_REPLY_ENABLED=true
```

`WHATSAPP_TEST_API_KEY` protects the test send routes. In production, requests must include this header:

```txt
x-api-key: change_this_secret_key
```

## Local webhook testing with ngrok

Run the app:

```bash
npm run dev
```

Expose local server:

```bash
ngrok http 3000
```

Use the HTTPS URL from ngrok as the Meta webhook callback URL:

```txt
https://your-ngrok-url.ngrok-free.app/api/whatsapp/webhook
```

Use the same verify token from env:

```txt
mytravel_verify_123
```

Subscribe to WhatsApp `messages` webhook events in Meta Developer Dashboard.

## Test 1: Send normal text message

```bash
curl -X POST "http://localhost:3000/api/whatsapp/test-send" \
  -H "Content-Type: application/json" \
  -H "x-api-key: change_this_secret_key" \
  -d '{
    "to": "919xxxxxxxxx",
    "message": "Test message from Dexplora travel automation"
  }'
```

If this message reaches WhatsApp, the Cloud API send setup is working.

## Test 2: Send OK / No button message

Customer should first message your WhatsApp test number, for example `Hi`, so the 24-hour customer service window is open.

Then run:

```bash
curl -X POST "http://localhost:3000/api/whatsapp/test-button" \
  -H "Content-Type: application/json" \
  -H "x-api-key: change_this_secret_key" \
  -d '{
    "to": "919xxxxxxxxx",
    "bookingId": "123",
    "question": "Dubai package confirm ആണോ?"
  }'
```

The customer will receive buttons:

```txt
[OK] [No]
```

## Test 3: Button click auto reply

When customer clicks `OK`, Meta sends a webhook event to:

```txt
POST /api/whatsapp/webhook
```

The webhook extracts the button id:

```txt
TRAVEL_CONFIRM_OK_BOOKING_123
```

Then it sends this auto reply:

```txt
Thank you. Your travel package confirmation has been received. Our team will update you shortly.
```

When customer clicks `No`, it sends:

```txt
Okay, noted. Our travel team will contact you shortly.
```

## Production notes

For real package automation, connect this webhook with the booking database:

```txt
button id received
→ parse booking id
→ update booking status
→ create activity log
→ send next WhatsApp reply
→ show status in admin panel
```

The current routes are intentionally simple for testing the WhatsApp Cloud API, webhook, button payload, and auto reply flow first.

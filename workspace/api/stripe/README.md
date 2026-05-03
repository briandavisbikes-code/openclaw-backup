# TruckPedia Stripe Integration

## Overview
Handle monthly subscription payments for API access using Stripe Checkout and Webhooks.

## Pricing Tiers
| Tier | Price | API Calls |
|------|-------|-----------|
| Free | $0 | 1/day (lookup only) |
| Basic | $9.99/mo | Constrained API |
| Pro | $19.99/mo | Unlimited |

---

## Setup

### 1. Install Dependencies

```bash
npm install stripe
```

### 2. Create Stripe Products and Prices

In the Stripe Dashboard:

1. Go to **Products → Add Product**
2. Create **TruckPedia Basic** — $9.99/month, recurring
3. Create **TruckPedia Pro** — $19.99/month, recurring
4. Copy the **Price IDs** (starts with `price_...`)

### 3. Create a Stripe Webhook Endpoint

In the Stripe Dashboard:

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/payments/webhook`
4. **Listen for events**: Select the following:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
5. Click **Add endpoint** and copy the **Signing secret** (`whsec_...`)

Or via Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3001/api/payments/webhook
# Output: "Ready! Your webhook signing secret is whsec_..."
```

### 4. Environment Variables

```bash
# .env
STRIPE_SECRET_KEY=sk_live_...          # Stripe secret key (sk_test_... for test mode)
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook signing secret
STRIPE_PRICE_BASIC=price_...            # Basic plan Price ID
STRIPE_PRICE_PRO=price_...              # Pro plan Price ID
APP_URL=https://yourdomain.com          # Public URL (no trailing slash)
```

---

## API Endpoints

### POST /api/payments/create-checkout

Start a Stripe Checkout session for Basic or Pro.

**Request:**
```json
{ "plan": "basic", "apiKey": "tpk_..." }
```
- `plan` — `"basic"` or `"pro"` (required)
- `apiKey` — optional, pass to correlate with a pre-created key

**Response:**
```json
{ "url": "https://checkout.stripe.com/...", "sessionId": "cs_..." }
```
Redirect the user to `url`.

---

### POST /api/payments/webhook

Stripe webhook receiver. **Must** be mounted with `express.raw()` — do not use `express.json()` on this route.

**Handled events:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activates API key + tier |
| `invoice.paid` | Renews subscription period |
| `customer.subscription.deleted` | Deactivates API key |

---

### GET /api/payments/subscription

Check subscription status for an API key or customer.

**Query params:** `?apiKey=tpk_...` or `?customerId=cus_...`

**Response:**
```json
{
  "hasSubscription": true,
  "active": true,
  "tier": "pro",
  "status": "active",
  "apiKey": "tpk_...",
  "currentPeriodEnd": "2026-04-25T00:00:00.000Z",
  "customerId": "cus_...",
  "subscriptionId": "sub_..."
}
```

---

### POST /api/payments/cancel

Redirects the user to the Stripe Customer Portal to self-serve cancel their subscription.

**Request:**
```json
{ "apiKey": "tpk_..." }
```

**Response:**
```json
{ "url": "https://billing.stripe.com/...", "message": "..." }
```

> We use Stripe's hosted Billing Portal for cancellations — never delete subscriptions directly via the API, as that bypasses Stripe's cancellation flow and refund policies.

---

## User Flow

1. User visits `/pricing` page
2. Clicks "Subscribe" on Basic or Pro
3. Frontend calls `POST /api/payments/create-checkout` with `{ plan: 'pro' }`
4. Server returns checkout URL → frontend redirects user
5. User completes payment on Stripe
6. Stripe sends `checkout.session.completed` webhook
7. Webhook handler activates the API key and stores customer/subscription info
8. User is shown their API key (and optionally emailed)
9. User makes API requests with `X-API-Key` header

---

## Integration Architecture

```
api/server.js
  ├── Stripe webhook mounted with express.raw()  →  POST /api/payments/webhook
  ├── POST /api/payments/create-checkout         →  checkout.js
  ├── GET  /api/payments/subscription            →  subscriptions.js
  └── POST /api/payments/cancel                  →  subscriptions.js

api/stripe/
  ├── index.js        — main export
  ├── checkout.js     — create Stripe Checkout sessions
  ├── webhook.js      — verify signature + dispatch events
  ├── subscriptions.js — check status + open billing portal
  └── store.js        — shared in-memory subscription store
```

**Rate limiting** reads from `stripe.store` automatically — if an API key exists in the store and is `active: true`, the paid tier limits apply.

---

## Production Notes

- **Database**: Replace `api/stripe/store.js` with a real database (Postgres, MongoDB, etc.) for durability and multi-instance deployments.
- **Webhook reliability**: Always return `200` quickly from the webhook handler. Do heavy processing async.
- **Email**: Wire up email delivery in `webhook.js → handleCheckoutSessionCompleted()` to send the user their API key.
- **Idempotency**: Stripe may retry webhooks. Use Stripe's event ID (`event.id`) for deduplication in production.
- **Test mode**: Use `sk_test_...` keys and `http://localhost:3001` as `APP_URL` for local development. Use `stripe listen` to forward webhooks locally.

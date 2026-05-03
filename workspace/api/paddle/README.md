# TruckPedia Paddle Integration

Replaces the previous Stripe integration with Paddle Billing for subscription payments.

## Products & Pricing

| Tier  | Price      | Paddle Price ID    |
|-------|-----------|--------------------|
| Basic | $9.99/mo  | `PADDLE_PRICE_BASIC` |
| Pro   | $19.99/mo | `PADDLE_PRICE_PRO`   |

## Environment Variables

```env
PADDLE_SERVER_TOKEN=pdl_live_apikey_...     # Paddle server API key
PADDLE_WEBHOOK_SECRET=...                   # Paddle webhook signing secret
PADDLE_PRICE_BASIC=pri_...                  # Basic plan Price ID
PADDLE_PRICE_PRO=pri_...                   # Pro plan Price ID
APP_URL=https://yourdomain.com              # Public URL
```

## API Endpoints

| Method | Path                          | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | `/api/payments/create-checkout` | Create Paddle checkout URL  |
| GET    | `/api/payments/subscription`   | Check subscription status   |
| POST   | `/api/payments/cancel`         | Cancel subscription         |
| POST   | `/api/payments/webhook`         | Paddle webhook handler      |

## Webhook Events Handled

- `subscription.created` — Logged (payment confirmation comes via `subscription.activated`)
- `subscription.activated` — Activates API key, stores tier + period
- `subscription.updated` — Updates tier if changed (upgrade/downgrade)
- `subscription.canceled` — Deactivates API key

## How Checkout Works

1. Client calls `POST /api/payments/create-checkout` with `{ plan: 'basic'|'pro', apiKey?: string }`
2. Server creates a Paddle Transaction with the subscription price ID
3. Server returns `{ url, transactionId }`
4. Client redirects user to the Paddle-hosted checkout page
5. On success, Paddle redirects to `{APP_URL}/success?transaction_id=...`
6. Paddle sends webhook event → API key activated

## How Paddle Webhooks Work

Paddle sends webhook requests with:
- Header: `paddle-signature: ts={timestamp};h1={hmac_hash}`
- Body: raw JSON

Webhook verification uses HMAC-SHA256 with the `PADDLE_WEBHOOK_SECRET`.

## File Structure

```
api/paddle/
├── index.js         # Main module — exports all functions + store
├── checkout.js      # POST /api/payments/create-checkout
├── webhook.js      # POST /api/payments/webhook
├── subscriptions.js # GET /api/payments/subscription + POST /api/payments/cancel
└── README.md        # This file
```

## Paddle SDK

Uses `@paddle/paddle-node-sdk` v3.6.0.

```js
const { Paddle } = require('@paddle/paddle-node-sdk');
const paddle = new Paddle(PADDLE_SERVER_TOKEN);

// Create checkout transaction
const tx = await paddle.transactions.create({
  items: [{ priceId, quantity: 1 }],
  checkout: { returnUrl, cancelUrl },
  customData: { apiKey: '...' },
});

// Verify webhook
const event = await paddle.webhooks.unmarshal(rawBody, secret, signature);

// Cancel subscription
await paddle.subscriptions.cancel(subscriptionId, { effectiveFrom: 'current_billing_period' });
```

## Notes

- Reuses `api/stripe/store.js` for the subscription data store (same schema)
- API key format: `tpk_` + 32 random alphanumeric chars
- The store is in-memory; in production, replace with a database

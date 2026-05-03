'use strict';

/**
 * TruckPedia Paddle Integration
 *
 * Exports:
 *   { createCheckout }  from './checkout'
 *   { handleWebhook }  from './webhook'
 *   { getSubscription, cancelSubscription } from './subscriptions'
 *   store              from '../stripe/store'  (shared with old Stripe impl)
 *
 * ─── Environment Variables ────────────────────────────────────────────────────
 *
 *   PADDLE_SERVER_TOKEN=pdl_live_apikey_...   # Paddle server-side API key
 *   PADDLE_WEBHOOK_SECRET=...                  # Paddle webhook signing secret
 *   PADDLE_PRICE_BASIC=pri_...               # Basic plan Price ID
 *   PADDLE_PRICE_PRO=pri_...                 # Pro plan Price ID
 *   APP_URL=https://yourdomain.com            # Public URL of the app
 */

const checkout = require('./checkout');
const webhook = require('./webhook');
const subscriptions = require('./subscriptions');

// Re-use the existing Stripe store — same schema, same logic.
const store = require('../stripe/store');

module.exports = {
  // POST /api/payments/create-checkout
  createCheckout: checkout.createCheckout,

  // POST /api/payments/webhook  (raw body — mount separately in server.js)
  handleWebhook: webhook.handleWebhook,

  // GET  /api/payments/subscription
  getSubscription: subscriptions.getSubscription,

  // POST /api/payments/cancel
  cancelSubscription: subscriptions.cancelSubscription,

  // Shared subscription store (for use by server.js rate limiter)
  store,
};

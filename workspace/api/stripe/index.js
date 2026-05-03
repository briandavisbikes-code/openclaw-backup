'use strict';

/**
 * TruckPedia Stripe Integration
 *
 * Exports:
 *   { createCheckout }  from './checkout'
 *   { handleWebhook }  from './webhook'
 *   { getSubscription, cancelSubscription } from './subscriptions'
 *   store              from './store'
 *
 * ─── Usage in server.js ───────────────────────────────────────────────────────
 *
 *   const stripe = require('./stripe');
 *
 *   // Webhook — MUST use express.raw() so req.body is the raw buffer
 *   app.post(
 *     '/api/payments/webhook',
 *     express.raw({ type: 'application/json' }),
 *     stripe.handleWebhook
 *   );
 *
 *   // All other payment routes — use express.json() middleware
 *   app.use('/api/payments', express.json(), (req, res, next) => {
 *     if (req.path === '/create-checkout')    return stripe.createCheckout(req, res);
 *     if (req.path === '/subscription')        return stripe.getSubscription(req, res);
 *     if (req.path === '/cancel')              return stripe.cancelSubscription(req, res);
 *     next();
 *   });
 *
 * ─── Environment Variables ────────────────────────────────────────────────────
 *
 *   STRIPE_SECRET_KEY=sk_live_...          # Stripe secret key
 *   STRIPE_WEBHOOK_SECRET=whsec_...       # Webhook signing secret
 *   STRIPE_PRICE_BASIC=price_...          # Basic plan Price ID
 *   STRIPE_PRICE_PRO=price_...           # Pro plan Price ID
 *   APP_URL=https://yourdomain.com        # Public URL of the app
 */

const checkout = require('./checkout');
const webhook = require('./webhook');
const subscriptions = require('./subscriptions');
const store = require('./store');

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

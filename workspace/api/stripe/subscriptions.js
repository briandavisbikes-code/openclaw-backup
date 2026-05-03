'use strict';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || 'http://localhost:3001';

let _stripe;
function getStripe() {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
    }
    const Stripe = require('stripe');
    _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
  }
  return _stripe;
}

const subStore = require('./store');

/**
 * GET /api/payments/subscription
 *
 * Query: ?apiKey=<key> or ?customerId=<cus_...>
 *
 * Returns the subscription status and plan for the given key or customer.
 */
async function getSubscription(req, res) {
  const { apiKey, customerId } = req.query;

  if (!apiKey && !customerId) {
    return res.status(400).json({
      error: 'Provide apiKey or customerId query parameter.',
    });
  }

  let record;

  if (apiKey) {
    record = subStore.getByApiKey(apiKey);
  } else {
    record = subStore.getByCustomerId(customerId);
  }

  if (!record) {
    return res.status(404).json({
      error: 'No subscription found for this identifier.',
      hasSubscription: false,
    });
  }

  const isActive = isSubscriptionActive(record);

  return res.status(200).json({
    hasSubscription: true,
    active: isActive,
    tier: record.tier,
    status: record.status || 'unknown',
    apiKey: record.apiKey,
    currentPeriodEnd: record.currentPeriodEnd
      ? new Date(record.currentPeriodEnd * 1000).toISOString()
      : null,
    customerId: record.customerId,
    subscriptionId: record.subscriptionId,
  });
}

/**
 * POST /api/payments/cancel
 *
 * Body: { apiKey?: string, customerId?: string }
 *
 * Redirects the user to the Stripe Customer Portal where they can
 * self-serve cancel their subscription. This is the recommended
 * Stripe approach — we do not delete subscriptions via the API
 * directly (which would bypass Stripe's cancellation flow).
 */
async function cancelSubscription(req, res) {
  const { apiKey, customerId } = req.body;

  if (!apiKey && !customerId) {
    return res.status(400).json({
      error: 'Provide apiKey or customerId in request body.',
    });
  }

  let customerIdToUse = customerId;

  if (!customerIdToUse && apiKey) {
    const record = subStore.getByApiKey(apiKey);
    if (!record) {
      return res.status(404).json({ error: 'No subscription found for this API key.' });
    }
    customerIdToUse = record.customerId;
  }

  if (!customerIdToUse) {
    return res.status(400).json({ error: 'No Stripe customer ID found.' });
  }

  try {
    const stripe = getStripe();

    // Create a Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerIdToUse,
      return_url: `${APP_URL}/pricing`,
    });

    console.log(`[Stripe] Billing portal session created for customer=${customerIdToUse}`);

    return res.status(200).json({
      url: portalSession.url,
      message:
        'Redirect the user to this URL to manage their subscription, including cancellation.',
    });
  } catch (err) {
    console.error('[Stripe] cancelSubscription error:', err.message);

    if (err.code === 'cus_delivered') {
      return res.status(400).json({ error: 'Customer has no active subscription.' });
    }

    return res.status(500).json({ error: 'Failed to create billing portal session.' });
  }
}

// ─── Helper ─────────────────────────────────────────────────────────────────────

function isSubscriptionActive(record) {
  if (!record || !record.active) return false;

  // Check period end (Stripe epoch timestamp)
  if (record.currentPeriodEnd) {
    const now = Math.floor(Date.now() / 1000);
    if (record.currentPeriodEnd < now) return false;
  }

  return true;
}

module.exports = { getSubscription, cancelSubscription };

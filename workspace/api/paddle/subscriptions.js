'use strict';

const { Paddle } = require('@paddle/paddle-node-sdk');

const PADDLE_SERVER_TOKEN = process.env.PADDLE_SERVER_TOKEN;
const APP_URL = process.env.APP_URL || 'http://localhost:3001';

// Lazy Paddle client
let _paddle;
function getPaddle() {
  if (!_paddle) {
    if (!PADDLE_SERVER_TOKEN) {
      throw new Error('PADDLE_SERVER_TOKEN environment variable is not set.');
    }
    _paddle = new Paddle(PADDLE_SERVER_TOKEN);
  }
  return _paddle;
}

const subStore = require('../stripe/store');

/**
 * GET /api/payments/subscription
 *
 * Query: ?apiKey=<key> or ?customerId=<ctm_...>
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
 * Cancels the subscription via Paddle and deactivates the API key.
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
    return res.status(400).json({ error: 'No Paddle customer ID found.' });
  }

  try {
    const paddle = getPaddle();

    // Find the active subscription for this customer
    const subs = await paddle.subscriptions.list({ customerId: customerIdToUse });
    const subPage = await subs.next();

    const activeSub = subPage.find(s => s.status === 'active' || s.status === 'trialing');

    if (!activeSub) {
      return res.status(400).json({ error: 'No active subscription found for this customer.' });
    }

    // Cancel the subscription in Paddle
    await paddle.subscriptions.cancel(activeSub.id, {
      effectiveFrom: 'current_billing_period',
    });

    // Deactivate in our store
    subStore.deactivateSubscription(customerIdToUse);

    console.log(`[Paddle] Subscription cancelled: sub=${activeSub.id} customer=${customerIdToUse}`);

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled. Access will remain until the end of the current billing period.',
      subscriptionId: activeSub.id,
    });
  } catch (err) {
    console.error('[Paddle] cancelSubscription error:', err.message);
    if (err.body) {
      console.error('[Paddle] Error details:', JSON.stringify(err.body, null, 2));
    }
    return res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
}

// ─── Helper ─────────────────────────────────────────────────────────────────────

function isSubscriptionActive(record) {
  if (!record || !record.active) return false;

  // Check period end (Unix epoch timestamp)
  if (record.currentPeriodEnd) {
    const now = Math.floor(Date.now() / 1000);
    if (record.currentPeriodEnd < now) return false;
  }

  return true;
}

module.exports = { getSubscription, cancelSubscription };

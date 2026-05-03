'use strict';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_BASIC = process.env.STRIPE_PRICE_BASIC;
const PRICE_PRO = process.env.STRIPE_PRICE_PRO;
const APP_URL = process.env.APP_URL || 'http://localhost:3001';

// Lazy Stripe client (avoids import errors when key not set)
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

/**
 * POST /api/payments/create-checkout
 *
 * Body: { plan: 'basic' | 'pro', apiKey?: string }
 *
 * Creates a Stripe Checkout session for a subscription.
 * Returns { url } — redirect the user to this URL.
 */
async function createCheckout(req, res) {
  const { plan, apiKey } = req.body;

  // Validate plan
  if (!plan || !['basic', 'pro'].includes(plan)) {
    return res.status(400).json({
      error: 'Invalid plan. Must be "basic" or "pro".',
    });
  }

  const priceId = plan === 'basic' ? PRICE_BASIC : PRICE_PRO;

  if (!priceId) {
    return res.status(500).json({
      error: `Price ID for ${plan} is not configured. Set STRIPE_PRICE_${plan.toUpperCase()} env var.`,
    });
  }

  const successUrl = `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${APP_URL}/pricing?cancelled=1`;

  try {
    const stripe = getStripe();

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    };

    // Attach the API key so we can correlate the checkout session
    // with an existing (pre-created) key in the webhook handler.
    if (apiKey) {
      sessionParams.metadata = { apiKey: apiKey.toString() };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`[Stripe] Checkout session created: ${session.id} for plan=${plan}`);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Stripe] createCheckout error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}

module.exports = { createCheckout };

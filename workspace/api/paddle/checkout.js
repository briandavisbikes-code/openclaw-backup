'use strict';

const { Paddle } = require('@paddle/paddle-node-sdk');

const PADDLE_SERVER_TOKEN = process.env.PADDLE_SERVER_TOKEN;
const PRICE_BASIC = process.env.PADDLE_PRICE_BASIC;
const PRICE_PRO = process.env.PADDLE_PRICE_PRO;
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

/**
 * POST /api/payments/create-checkout
 *
 * Body: { plan: 'basic' | 'pro', apiKey?: string }
 *
 * Creates a Paddle Transaction that acts as a hosted checkout session.
 * Returns { url } — redirect the user to this URL to complete payment.
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
      error: `Price ID for ${plan} is not configured. Set PADDLE_PRICE_${plan.toUpperCase()} env var.`,
    });
  }

  const successUrl = `${APP_URL}/success?transaction_id={transaction_id}`;
  const cancelUrl = `${APP_URL}/pricing?cancelled=1`;

  try {
    const paddle = getPaddle();

    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],
      customer: {
        email: 'temp@example.com', // Paddle will prompt for real email on checkout
      },
      checkout: {
        returnUrl: successUrl,
        cancelUrl: cancelUrl,
      },
      customData: apiKey ? { apiKey: apiKey.toString() } : undefined,
      currencyCode: 'USD',
    });

    console.log(`[Paddle] Checkout transaction created: ${transaction.id} for plan=${plan}`);

    if (!transaction.checkout?.url) {
      console.error('[Paddle] No checkout URL in transaction response:', JSON.stringify(transaction, null, 2));
      return res.status(500).json({ error: 'Failed to create checkout URL.' });
    }

    return res.status(200).json({
      url: transaction.checkout.url,
      transactionId: transaction.id,
    });
  } catch (err) {
    console.error('[Paddle] createCheckout error:', err.message);
    if (err.body) {
      console.error('[Paddle] Error details:', JSON.stringify(err.body, null, 2));
    }
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}

module.exports = { createCheckout };

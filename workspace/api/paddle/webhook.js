'use strict';

const { Paddle } = require('@paddle/paddle-node-sdk');

const PADDLE_SERVER_TOKEN = process.env.PADDLE_SERVER_TOKEN;
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

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

// Re-use existing subscription store
const subStore = require('../stripe/store');

/**
 * POST /api/payments/webhook
 *
 * Paddle sends raw JSON body → verify signature → dispatch to handlers.
 *
 * NOTE: server.js mounts this with express.raw({ type: 'application/json' })
 * so req.body is the raw Buffer (needed for signature verification).
 */
async function handleWebhook(req, res) {
  const signature = req.get('paddle-signature');

  if (!signature) {
    console.warn('[Paddle Webhook] Missing paddle-signature header.');
    return res.status(400).json({ error: 'Missing paddle-signature header.' });
  }

  if (!PADDLE_WEBHOOK_SECRET) {
    console.error('[Paddle Webhook] PADDLE_WEBHOOK_SECRET is not set.');
    return res.status(500).json({ error: 'Webhook secret not configured.' });
  }

  // Get raw body as string
  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body, 'utf-8');

  let event;
  try {
    const paddle = getPaddle();
    event = await paddle.webhooks.unmarshal(rawBody.toString('utf-8'), PADDLE_WEBHOOK_SECRET, signature);
  } catch (err) {
    console.error('[Paddle Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  console.log(`[Paddle Webhook] Received event: ${event.eventType} (${event.id})`);

  try {
    switch (event.eventType) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(event.data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;

      default:
        console.log(`[Paddle Webhook] Unhandled event type: ${event.eventType}`);
    }
  } catch (err) {
    console.error(`[Paddle Webhook] Handler error for ${event.eventType}:`, err.message);
    // Return 200 to avoid Paddle retry storms for handler errors.
    // Log and fix the handler; Paddle will not retry automatically on 2xx.
    return res.status(200).json({ received: true, warning: `Handler error: ${err.message}` });
  }

  return res.status(200).json({ received: true });
}

// ─── Event Handlers ────────────────────────────────────────────────────────────

/**
 * subscription.created
 * Fires when a new subscription is created (before payment is collected).
 * We wait for `subscription.activated` to activate the key (payment confirmed).
 */
async function handleSubscriptionCreated(subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customerId;

  console.log(`[Paddle] subscription.created → sub=${subscriptionId} customer=${customerId}`);
  // No action needed yet — wait for subscription.activated
}

/**
 * subscription.activated
 * Fires when a subscription is activated (payment successful, trial started, etc.).
 * This is where we activate the API key.
 */
async function handleSubscriptionActivated(subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customerId;
  const customData = subscription.customData || {};
  const apiKeyFromCheckout = customData.apiKey || null;

  console.log(`[Paddle] subscription.activated → sub=${subscriptionId} customer=${customerId}`);

  try {
    // Get the subscription with items to determine tier
    const paddle = getPaddle();
    const fullSub = await paddle.subscriptions.get(subscriptionId);

    const tier = resolveTierFromSubscription(fullSub);

    // Generate or use provided API key
    const keyToActivate = apiKeyFromCheckout || generateApiKey();

    // Get billing period for period end
    const currentPeriodEnd = fullSub.currentBillingPeriod?.endsAt
      ? Math.floor(new Date(fullSub.currentBillingPeriod.endsAt).getTime() / 1000)
      : null;

    subStore.activateSubscription({
      customerId,
      subscriptionId,
      tier,
      apiKey: keyToActivate,
      currentPeriodStart: Math.floor(Date.now() / 1000),
      currentPeriodEnd,
    });

    console.log(`[Paddle] Subscription activated: tier=${tier} key=${keyToActivate}`);

    // TODO: Email the API key to the customer if we have their email
    // const customer = await paddle.customers.get(customerId);
    // await sendApiKeyEmail(customer.email, keyToActivate, tier);
  } catch (err) {
    console.error('[Paddle] handleSubscriptionActivated error:', err.message);
    throw err;
  }
}

/**
 * subscription.updated
 * Fires when a subscription changes (e.g., upgrade, downgrade, change in billing).
 */
async function handleSubscriptionUpdated(subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customerId;

  console.log(`[Paddle] subscription.updated → sub=${subscriptionId} customer=${customerId}`);

  try {
    const paddle = getPaddle();
    const fullSub = await paddle.subscriptions.get(subscriptionId);

    const tier = resolveTierFromSubscription(fullSub);

    const currentPeriodEnd = fullSub.currentBillingPeriod?.endsAt
      ? Math.floor(new Date(fullSub.currentBillingPeriod.endsAt).getTime() / 1000)
      : null;

    subStore.updateSubscription(customerId, {
      tier,
      status: fullSub.status,
      currentPeriodEnd,
    });

    console.log(`[Paddle] Subscription updated: tier=${tier} status=${fullSub.status}`);
  } catch (err) {
    console.error('[Paddle] handleSubscriptionUpdated error:', err.message);
    throw err;
  }
}

/**
 * subscription.canceled
 * Fires when a subscription is cancelled.
 */
async function handleSubscriptionCanceled(subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customerId;

  console.log(`[Paddle] subscription.canceled → sub=${subscriptionId} customer=${customerId}`);

  try {
    subStore.deactivateSubscription(customerId);
    console.log(`[Paddle] Subscription deactivated: sub=${subscriptionId}`);
  } catch (err) {
    console.error('[Paddle] handleSubscriptionCanceled error:', err.message);
    throw err;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Determine the tier ('basic' | 'pro') from a Paddle subscription object.
 * Matches against configured PADDLE_PRICE_BASIC and PADDLE_PRICE_PRO.
 */
function resolveTierFromSubscription(subscription) {
  const PRICE_BASIC = process.env.PADDLE_PRICE_BASIC;
  const PRICE_PRO = process.env.PADDLE_PRICE_PRO;

  // Get the first item's price ID
  const priceId = subscription.items?.[0]?.price?.id;

  if (!priceId) {
    console.warn('[Paddle] No price ID found in subscription items, defaulting to basic');
    return 'basic';
  }

  if (priceId === PRICE_PRO) return 'pro';
  if (priceId === PRICE_BASIC) return 'basic';

  // Fallback: try to guess from product name/description
  const description = subscription.items[0].price?.description || '';
  const name = subscription.items[0].price?.name || '';
  const productName = subscription.items[0].product?.name || '';

  const combined = `${name} ${description} ${productName}`.toLowerCase();
  if (combined.includes('pro')) return 'pro';
  if (combined.includes('basic')) return 'basic';

  return 'basic';
}

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'tpk_'; // TruckPedia Key prefix
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

module.exports = { handleWebhook };
module.exports.subStore = subStore;

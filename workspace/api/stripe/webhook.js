'use strict';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Lazy Stripe client
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

// ─── Subscription Store ─────────────────────────────────────────────────────────
// In production, replace with a proper database (Postgres, MongoDB, etc.)
// This module is imported by subscriptions.js as well.
const subStore = require('./store');

/**
 * POST /api/payments/webhook
 *
 * Stripe sends raw body → verify signature → dispatch to handlers.
 *
 * NOTE: server.js mounts this with express.raw({ type: 'application/json' })
 * so req.body is the raw Buffer (needed for signature verification).
 */
async function handleWebhook(req, res) {
  const sig = req.get('Stripe-Signature');

  if (!sig) {
    console.warn('[Stripe Webhook] Missing Stripe-Signature header.');
    return res.status(400).json({ error: 'Missing Stripe-Signature header.' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set.');
    return res.status(500).json({ error: 'Webhook secret not configured.' });
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err.message);
    // Return 200 to avoid Stripe retry storms for handler errors.
    // Log and fix the handler; Stripe will not retry automatically on 2xx.
    return res.status(200).json({ received: true, warning: `Handler error: ${err.message}` });
  }

  return res.status(200).json({ received: true });
}

// ─── Event Handlers ────────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 * Fires when a user completes Stripe Checkout.
 * We activated the subscription and API key here.
 */
async function handleCheckoutSessionCompleted(session) {
  // Only handle subscription-mode sessions
  if (session.mode !== 'subscription') return;

  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const apiKey = session.metadata?.apiKey || null;

  console.log(`[Stripe] checkout.session.completed → customer=${customerId} sub=${subscriptionId}`);

  try {
    const stripe = getStripe();

    // Retrieve the full subscription object to get price info
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price?.id;

    // Determine tier from price
    const tier = resolveTierFromPriceId(priceId);

    // Activate the API key if one was passed in metadata, otherwise create one
    const keyToActivate = apiKey || generateApiKey();

    subStore.activateSubscription({
      customerId,
      subscriptionId,
      tier,
      apiKey: keyToActivate,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
    });

    console.log(`[Stripe] Subscription activated: tier=${tier} key=${keyToActivate}`);

    // TODO: Email the API key to the customer (session.customer_email or session.metadata)
    // await sendApiKeyEmail(session.customer_email, keyToActivate, tier);
  } catch (err) {
    console.error('[Stripe] handleCheckoutSessionCompleted error:', err.message);
    throw err; // Propagate so we return non-200 and Stripe retries
  }
}

/**
 * invoice.paid
 * Fires on each successful payment renewal.
 * Ensures the subscription stays active and period is extended.
 */
async function handleInvoicePaid(invoice) {
  // Only subscription invoices have a subscription ID
  if (!invoice.subscription) return;

  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  const amountPaid = invoice.amount_paid;

  console.log(`[Stripe] invoice.paid → sub=${subscriptionId} amount=${amountPaid}`);

  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = resolveTierFromPriceId(priceId);

    subStore.updateSubscription(customerId, {
      tier,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
    });

    console.log(`[Stripe] Subscription renewed: sub=${subscriptionId} tier=${tier}`);
  } catch (err) {
    console.error('[Stripe] handleInvoicePaid error:', err.message);
    throw err;
  }
}

/**
 * customer.subscription.deleted
 * Fires when a customer cancels and their subscription ends.
 */
async function handleSubscriptionDeleted(subscription) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  console.log(`[Stripe] customer.subscription.deleted → sub=${subscriptionId} customer=${customerId}`);

  try {
    subStore.deactivateSubscription(customerId);
    console.log(`[Stripe] Subscription deactivated: sub=${subscriptionId}`);
  } catch (err) {
    console.error('[Stripe] handleSubscriptionDeleted error:', err.message);
    throw err;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function resolveTierFromPriceId(priceId) {
  const BASIC_PRICE = process.env.STRIPE_PRICE_BASIC;
  const PRO_PRICE = process.env.STRIPE_PRICE_PRO;

  if (priceId === BASIC_PRICE) return 'basic';
  if (priceId === PRO_PRICE) return 'pro';
  return 'basic'; // fallback
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

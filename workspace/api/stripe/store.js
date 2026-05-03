'use strict';

/**
 * Shared in-memory store for subscription and customer data.
 *
 * In production, replace this with a real database (Postgres, MongoDB,
 * DynamoDB, etc.) with proper indexes on customerId, apiKey, and subscriptionId.
 *
 * Schema per record:
 * {
 *   customerId:     string,   // Stripe customer ID (cus_...)
 *   subscriptionId: string,  // Stripe subscription ID (sub_...)
 *   apiKey:         string,   // TruckPedia API key (tpk_...)
 *   tier:          'basic' | 'pro',
 *   status:        string,    // Stripe subscription status
 *   active:        boolean,
 *   currentPeriodStart: number, // Unix epoch
 *   currentPeriodEnd:   number, // Unix epoch
 *   createdAt:     Date,
 *   updatedAt:     Date,
 * }
 */

const store = new Map(); // key: customerId → record
const byApiKey = new Map(); // key: apiKey → record
const bySubscriptionId = new Map(); // key: subscriptionId → record

// ─── Activation ───────────────────────────────────────────────────────────────

/**
 * Activate (or re-activate) a subscription.
 * Creates or updates the record for this customer.
 */
function activateSubscription({ customerId, subscriptionId, tier, apiKey, currentPeriodStart, currentPeriodEnd }) {
  // Remove any existing record under this customer or apiKey to avoid duplicates
  const existing = store.get(customerId);
  if (existing) {
    byApiKey.delete(existing.apiKey);
    bySubscriptionId.delete(existing.subscriptionId);
  }

  const record = {
    customerId,
    subscriptionId,
    apiKey,
    tier,
    status: 'active',
    active: true,
    currentPeriodStart: currentPeriodStart || null,
    currentPeriodEnd: currentPeriodEnd || null,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  store.set(customerId, record);
  byApiKey.set(apiKey, record);
  bySubscriptionId.set(subscriptionId, record);

  console.log(`[Store] Activated: customer=${customerId} sub=${subscriptionId} tier=${tier} key=${apiKey}`);
  return record;
}

// ─── Deactivation ─────────────────────────────────────────────────────────────

/**
 * Deactivate a subscription (cancelled or expired).
 * Keeps the record but marks it inactive.
 */
function deactivateSubscription(customerId) {
  const record = store.get(customerId);
  if (!record) {
    console.warn(`[Store] deactivateSubscription: no record for customer=${customerId}`);
    return null;
  }

  record.active = false;
  record.status = 'canceled';
  record.updatedAt = new Date();

  // Remove from apiKey index so the key stops working immediately
  byApiKey.delete(record.apiKey);
  bySubscriptionId.delete(record.subscriptionId);

  console.log(`[Store] Deactivated: customer=${customerId}`);
  return record;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update fields on an existing subscription record.
 */
function updateSubscription(customerId, updates) {
  const record = store.get(customerId);
  if (!record) {
    console.warn(`[Store] updateSubscription: no record for customer=${customerId}`);
    return null;
  }

  Object.assign(record, updates, { updatedAt: new Date() });

  // Re-index if tier changed
  if (updates.tier) {
    // tier is already updated via Object.assign above
  }

  console.log(`[Store] Updated: customer=${customerId}`, updates);
  return record;
}

// ─── Lookups ───────────────────────────────────────────────────────────────────

function getByCustomerId(customerId) {
  return store.get(customerId) || null;
}

function getByApiKey(apiKey) {
  return byApiKey.get(apiKey) || null;
}

function getBySubscriptionId(subscriptionId) {
  return bySubscriptionId.get(subscriptionId) || null;
}

/**
 * Returns all active subscriptions.
 */
function getAllActive() {
  return [...store.values()].filter(r => r.active);
}

/**
 * Debug: list all records.
 */
function getAll() {
  return [...store.values()];
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  activateSubscription,
  deactivateSubscription,
  updateSubscription,
  getByCustomerId,
  getByApiKey,
  getBySubscriptionId,
  getAllActive,
  getAll,
};

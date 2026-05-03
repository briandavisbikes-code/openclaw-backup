const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Serve Landing Page ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ─── Stripe Integration ────────────────────────────────────────────────────────
const stripe = require('./stripe');

// Mount the webhook route FIRST with raw body parser (required for Stripe signature verification).
// This must be before express.json() since Stripe needs the raw request buffer.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  stripe.handleWebhook
);

// All other /api/payments routes use JSON body parsing.
app.use('/api/payments', express.json());
app.post('/api/payments/create-checkout',   stripe.createCheckout);
app.get('/api/payments/subscription',     stripe.getSubscription);
app.post('/api/payments/cancel',           stripe.cancelSubscription);

// ─── Load Data ────────────────────────────────────────────────────────────────
const DATA_PATH = path.join(__dirname, 'public/api/trucks.json');

let trucks = [];

try {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  trucks = JSON.parse(raw);
  console.log(`[TruckPedia] Loaded ${trucks.length} trucks`);
} catch (err) {
  console.error('[TruckPedia] Failed to load trucks.json:', err.message);
  process.exit(1);
}

// ─── API Key Store ─────────────────────────────────────────────────────────────
// Free/dev keys are in the local object. Paid keys are managed by the Stripe store.
const API_KEYS = {
  // key: { tier: 'free' | 'basic' | 'pro' }
};

const TIERS = {
  free:  { limit: 60,  windowMs: 60000  },  // 60 req/min
  basic: { limit: 300, windowMs: 60000  },  // 300 req/min
  pro:   { limit: 1000,windowMs: 60000  },  // 1000 req/min
};

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Rate Limiter ──────────────────────────────────────────────────────────────
function rateLimiter(req, res, next) {
  const key = req.get('X-API-Key');
  let tier = 'free';

  if (key) {
    // Check local free/dev keys first, then the Paddle-paid store
    if (API_KEYS[key]) {
      tier = API_KEYS[key].tier;
    } else {
      const record = stripe.store.getByApiKey(key);
      if (record && record.active) {
        tier = record.tier;
      }
    }
  }

  const { limit, windowMs } = TIERS[tier];

  // Simple in-memory sliding window counter (per-process)
  const now = Date.now();
  if (!rateLimiter.counts) rateLimiter.counts = {};

  const bucketKey = `${tier}:${Math.floor(now / windowMs)}`;

  if (!rateLimiter.counts[bucketKey]) rateLimiter.counts[bucketKey] = 0;
  rateLimiter.counts[bucketKey]++;

  // Clean old buckets
  Object.keys(rateLimiter.counts).forEach(k => {
    const [t, ts] = k.split(':');
    if (now - parseInt(ts) * windowMs > windowMs * 2) delete rateLimiter.counts[k];
  });

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - rateLimiter.counts[bucketKey]));
  res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

  if (rateLimiter.counts[bucketKey] > limit) {
    return res.status(429).json({ error: 'Rate limit exceeded', tier });
  }

  next();
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requirePaid(req, res, next) {
  const key = req.get('X-API-Key');

  if (!key) {
    return res.status(403).json({
      error: 'Paid subscription required. Provide a valid X-API-Key.',
    });
  }

  // Check local free/dev keys
  if (API_KEYS[key]) {
    req.tier = API_KEYS[key].tier;
    return next();
  }

  // Check Paddle-paid store
  const record = stripe.store.getByApiKey(key);
  if (!record || !record.active) {
    return res.status(403).json({
      error: 'Paid subscription required. Provide a valid X-API-Key.',
    });
  }

  req.tier = record.tier;
  next();
}

// ─── Helper: Normalize query ──────────────────────────────────────────────────
function normalize(str) {
  return (str || '').trim().toLowerCase();
}

// ─── Endpoint: GET /api/truck ──────────────────────────────────────────────────
// FREE tier: exact match on make + model + year (single result)
app.get('/api/truck', rateLimiter, (req, res) => {
  const { make, model, year } = req.query;

  // Validate all three required params
  if (!make || !model || !year) {
    return res.status(400).json({
      error: 'Missing required parameters: make, model, and year are all required.',
    });
  }

  // FREE tier: no year ranges, no broad searches
  // A year range would be ?year_min=2020&year_max=2024
  if (req.query.year_min !== undefined || req.query.year_max !== undefined) {
    return res.status(403).json({
      error: 'Year range searches are not available on the free tier. Upgrade for full API access.',
    });
  }

  // FREE tier: can't search by make alone (broad search)
  // We allow make+model+year only (exact triple)
  const makeNorm  = normalize(make);
  const modelNorm = normalize(model);
  const yearNum   = parseInt(year, 10);

  if (isNaN(yearNum)) {
    return res.status(400).json({ error: 'Year must be a valid integer.' });
  }

  const results = trucks.filter(t =>
    normalize(t.make)  === makeNorm  &&
    normalize(t.model) === modelNorm &&
    t.year === yearNum
  );

  if (results.length === 0) {
    return res.status(404).json({ error: 'No truck found matching those exact criteria.' });
  }

  // Free tier: return first match only
  res.json({
    source: 'free',
    count: 1,
    truck: results[0],
  });
});

// ─── Endpoint: GET /api/trucks ─────────────────────────────────────────────────
// PAID tier: full search with filters
app.get('/api/trucks', rateLimiter, requirePaid, (req, res) => {
  const {
    make, model, year,
    year_min, year_max,
    bodyStyle, cabType, bedLength,
    engine, transmission, drivetrain,
    fuelType, soldInUS,
    minHorsepower, maxHorsepower,
    minTorque, maxTorque,
    minCityMpg, maxCityMpg,
    minHighwayMpg, maxHighwayMpg,
    minTowingCapacity, maxTowingCapacity,
    minPayload, maxPayload,
    countryOfOrigin,
    sortBy, sortOrder = 'asc',
    page = 1, limit = 50,
  } = req.query;

  let results = [...trucks];

  // Filters
  if (make)         results = results.filter(t => normalize(t.make)  === normalize(make));
  if (model)        results = results.filter(t => normalize(t.model) === normalize(model));
  if (year)         results = results.filter(t => t.year === parseInt(year, 10));

  if (year_min)     results = results.filter(t => t.year >= parseInt(year_min, 10));
  if (year_max)     results = results.filter(t => t.year <= parseInt(year_max, 10));
  if (bodyStyle)    results = results.filter(t => normalize(t.bodyStyle) === normalize(bodyStyle));
  if (cabType)      results = results.filter(t => normalize(t.cabType)   === normalize(cabType));
  if (bedLength)    results = results.filter(t => normalize(t.bedLength) === normalize(bedLength));
  if (engine)       results = results.filter(t => normalize(t.engine)    === normalize(engine));
  if (transmission) results = results.filter(t => normalize(t.transmission) === normalize(transmission));
  if (drivetrain)   results = results.filter(t => normalize(t.drivetrain) === normalize(drivetrain));
  if (fuelType)     results = results.filter(t => normalize(t.fuelType)  === normalize(fuelType));
  if (countryOfOrigin) results = results.filter(t => normalize(t.countryOfOrigin) === normalize(countryOfOrigin));

  if (soldInUS !== undefined)  results = results.filter(t => t.soldInUS === (soldInUS === 'true'));

  if (minHorsepower)  results = results.filter(t => t.horsepower >= parseInt(minHorsepower, 10));
  if (maxHorsepower)  results = results.filter(t => t.horsepower <= parseInt(maxHorsepower, 10));
  if (minTorque)      results = results.filter(t => t.torque     >= parseInt(minTorque, 10));
  if (maxTorque)      results = results.filter(t => t.torque     <= parseInt(maxTorque, 10));
  if (minCityMpg)     results = results.filter(t => t.cityMpg    >= parseInt(minCityMpg, 10));
  if (maxCityMpg)     results = results.filter(t => t.cityMpg    <= parseInt(maxCityMpg, 10));
  if (minHighwayMpg)  results = results.filter(t => t.highwayMpg >= parseInt(minHighwayMpg, 10));
  if (maxHighwayMpg)  results = results.filter(t => t.highwayMpg <= parseInt(maxHighwayMpg, 10));
  if (minTowingCapacity) results = results.filter(t => t.towingCapacity >= parseInt(minTowingCapacity, 10));
  if (maxTowingCapacity) results = results.filter(t => t.towingCapacity <= parseInt(maxTowingCapacity, 10));
  if (minPayload)     results = results.filter(t => t.payload >= parseInt(minPayload, 10));
  if (maxPayload)     results = results.filter(t => t.payload <= parseInt(maxPayload, 10));

  // Sort
  const sortFields = ['year','make','model','horsepower','torque','cityMpg','highwayMpg','towingCapacity','payload'];
  if (sortBy && sortFields.includes(sortBy)) {
    const order = sortOrder === 'desc' ? -1 : 1;
    results.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * order;
      if (a[sortBy] > b[sortBy]) return  1 * order;
      return 0;
    });
  }

  // Pagination
  const total    = results.length;
  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const offset   = (pageNum - 1) * limitNum;
  const paged    = results.slice(offset, offset + limitNum);

  res.json({
    source: 'paid',
    tier: req.tier,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    trucks: paged,
  });
});

// ─── Endpoint: GET /api/makes ──────────────────────────────────────────────────
app.get('/api/makes', rateLimiter, (req, res) => {
  const makes = [...new Set(trucks.map(t => t.make))].sort();
  res.json({ count: makes.length, makes });
});

// ─── Endpoint: GET /api/models ─────────────────────────────────────────────────
app.get('/api/models', rateLimiter, (req, res) => {
  const { make } = req.query;
  if (!make) {
    return res.status(400).json({ error: 'make parameter is required.' });
  }
  const makeNorm = normalize(make);
  const models = [...new Set(
    trucks.filter(t => normalize(t.make) === makeNorm).map(t => t.model)
  )].sort();
  res.json({ make, count: models.length, models });
});

// ─── Endpoint: GET /api/years ──────────────────────────────────────────────────
app.get('/api/years', rateLimiter, (req, res) => {
  const years = [...new Set(trucks.map(t => t.year))].sort((a, b) => a - b);
  res.json({ count: years.length, years });
});

// ─── Endpoint: GET /api/stats ─────────────────────────────────────────────────
app.get('/api/stats', rateLimiter, (req, res) => {
  const makes = [...new Set(trucks.map(t => t.make))];
  const models = [...new Set(trucks.map(t => t.model))];
  const years = [...new Set(trucks.map(t => t.year))];
  res.json({
    totalTrucks: trucks.length,
    makes: makes.length,
    models: models.length,
    years: years.length,
    yearRange: { min: Math.min(...years), max: Math.max(...years) },
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', trucks: trucks.length, timestamp: new Date().toISOString() });
});

// ─── Serve trucks.json for frontend ───────────────────────────────────────────
app.get('/api/trucks.json', (req, res) => {
  res.sendFile(DATA_PATH);
});

// ─── Admin: Register API Key (dev only) ───────────────────────────────────────
// POST /api/admin/keys  { key, tier }
// NOTE: Paid keys from Paddle Checkout are auto-created and stored in the store.
//       Only use this endpoint for free-tier dev keys.
app.post('/api/admin/keys', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Disabled in production.' });
  }
  const { key, tier = 'free' } = req.body;
  if (!key || !TIERS[tier]) {
    return res.status(400).json({ error: 'Provide a valid key and tier (free|basic|pro).' });
  }
  if (tier === 'free') {
    API_KEYS[key] = { tier };
    res.json({ success: true, key, tier, message: 'Free dev key registered in-memory.' });
  } else {
    // For paid tiers in dev, register directly in the store
    stripe.store.activateSubscription({
      customerId: 'dev_customer',
      subscriptionId: 'dev_subscription',
      tier,
      apiKey: key,
      currentPeriodStart: Math.floor(Date.now() / 1000),
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 86400 * 30,
    });
    res.json({ success: true, key, tier, message: 'Dev paid key registered. Do not use in production.' });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[TruckPedia] API server running on http://localhost:${PORT}`);
  console.log(`[TruckPedia] Endpoints:`);
  console.log(`  GET /api/truck?make=&model=&year=     [FREE - exact match]`);
  console.log(`  GET /api/trucks?...                    [PAID]`);
  console.log(`  GET /api/makes                         [FREE]`);
  console.log(`  GET /api/models?make=                  [FREE]`);
  console.log(`  GET /api/years                         [FREE]`);
  console.log(`  GET /api/stats                         [FREE]`);
  console.log(`  GET /api/health                        [FREE]`);
  console.log(`  POST /api/admin/keys (dev only)        [NO AUTH]`);
  console.log(`  POST /api/payments/create-checkout     [Paddle Checkout]`);
  console.log(`  POST /api/payments/webhook             [Paddle Webhook]`);
  console.log(`  GET  /api/payments/subscription       [Check subscription]`);
  console.log(`  POST /api/payments/cancel              [Paddle]`);
});

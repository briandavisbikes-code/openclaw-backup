# TruckPedia API Documentation

**Base URL:** `https://api.truckpedia.net`

**Tagline:** 26,000+ trucks, one endpoint. The truck data API for developers.

> **Dynamic Database:** Our truck database grows daily. We continuously add new makes, models, and years to keep our data current. The database is not static—it's actively maintained and expanded.

> **Data Quality:** 92%+ of our database is fully complete with verified specifications. Missing data is flagged with `incompleteFields` so you always know what you're getting.

---

## Quick Start

### Free Tier (No Auth Required)

```bash
# Lookup by make, model, and year
GET https://api.truckpedia.net/api/truck?make=Ford&model=F-150&year=2022
```

**Limit:** 1 request per day. No authentication required.

---

### Authentication

Get your API key from your dashboard.

```bash
# Include API key in header
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api.truckpedia.net/api/trucks
```

---

## Endpoints

### `GET /api/truck`

Free tier endpoint. Returns truck data for a specific make/model/year.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `make` | string | Yes | Manufacturer name (e.g., "Ford", "Chevrolet", "Ram") |
| `model` | string | Yes | Model name (e.g., "F-150", "Silverado", "1500") |
| `year` | integer | Yes | Model year (1940-2026) |

**Response:**
```json
{
  "source": "free",
  "count": 1,
  "truck": {
    "id": "ford-f150-2022-xlt",
    "make": "Ford",
    "model": "F-150",
    "year": 2022,
    "trim": "XLT",
    "engine": "3.5L EcoBoost V6",
    "horsepower": 400,
    "torque": 500,
    "transmission": "10-Speed Automatic",
    "drivetrain": "4WD",
    "cabType": "Crew Cab",
    "bedLength": "5.5 ft",
    "towingCapacity": 14000,
    "payload": 3300,
    "cityMpg": 18,
    "highwayMpg": 24,
    "fuelType": "Gasoline",
    "incompleteFields": []
  }
}
```

**Note:** The `incompleteFields` array shows any fields with missing data (e.g., `["horsepower", "torque"]`). Empty array means all fields are complete.

---

### `GET /api/trucks`

Search or filter trucks. **API Plan only.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `make` | string | No | Filter by manufacturer |
| `model` | string | No | Filter by model name |
| `year` | integer | No | Filter by year (or `year_min`, `year_max`) |
| `engine` | string | No | Engine type (e.g., "V6", "V8", "diesel", "hybrid") |
| `drivetrain` | string | No | Drivetrain (e.g., "4WD", "2WD", "AWD") |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Results per page (default: 50, max: 500) |

---

### `GET /api/makes`

List all available makes.

```bash
curl https://api.truckpedia.net/api/makes
```

---

### `GET /api/models`

List models for a make.

```bash
curl "https://api.truckpedia.net/api/models?make=Ford"
```

---

### `GET /api/years`

List years with available data.

```bash
curl https://api.truckpedia.net/api/years
```

---

## Rate Limits

| Tier | Requests/Day | Requests/Minute | Auth Required |
|------|-------------|-----------------|---------------|
| **Free** | 1 | - | No |
| **API Plan** | 1,000 | 10 | Yes |

**Headers included in every response:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1711478400
```

---

## Data Fields

### Truck Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique truck identifier |
| `make` | string | Manufacturer |
| `model` | string | Model name |
| `year` | integer | Model year |
| `trim` | string | Trim level |
| `engine` | string | Engine description |
| `horsepower` | integer | Horsepower |
| `torque` | integer | Torque (lb-ft) |
| `transmission` | string | Transmission type |
| `drivetrain` | string | Drivetrain configuration |
| `cabType` | string | Cab style |
| `bedLength` | string | Bed length |
| `towingCapacity` | integer | Max towing (lbs) |
| `payload` | integer | Max payload (lbs) |
| `curbWeight` | integer | Curb weight |
| `cityMpg` | integer | MPG city |
| `highwayMpg` | integer | MPG highway |
| `fuelType` | string | Fuel type |
| `soldInUS` | boolean | Sold in US |
| `countryOfOrigin` | string | Country of origin |
| `incompleteFields` | array | List of fields with missing data |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `400` | `INVALID_REQUEST` | Missing or malformed parameters |
| `401` | `UNAUTHORIZED` | Missing or invalid API key |
| `403` | `TIER_RESTRICTED` | Endpoint requires API Plan |
| `404` | `NOT_FOUND` | Truck not found |
| `429` | `RATE_LIMITED` | Request quota exceeded |
| `500` | `INTERNAL_ERROR` | Server error. Try again. |

---

## Support

- Email: support@truckpedia.net

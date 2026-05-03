# API Specific Terms

**Effective: 2026-03-25**

## 1. API Key Ownership

### 1.1 Key Grant
Upon account creation, TruckPedia grants you a unique API key(s) for accessing the Service. API keys remain the property of TruckPedia and are licensed, not sold, to you.

### 1.2 Your Responsibilities
- Keep API keys confidential
- Restrict key access to authorized individuals within your organization
- Notify us immediately of any unauthorized access
- Implement appropriate access controls in your applications

### 1.3 Key Deactivation
We reserve the right to deactivate or rotate API keys:
- Upon account termination
- For security violations
- For Terms of Service violations
- Upon subscription changes

## 2. Rate Limits

### 2.1 Plan-Based Limits

| Plan | Daily Requests | Monthly Cap | Burst Limit |
|------|---------------|-------------|-------------|
| Free | 1 | 30 | 1/minute |
| Basic | 1,000 | 30,000 | 50/minute |
| Pro | 10,000 | Unlimited | 200/minute |

### 2.2 Rate Limit Headers
All API responses include headers indicating your current status:
```
X-RateLimit-Limit: [limit]
X-RateLimit-Remaining: [remaining]
X-RateLimit-Reset: [unix_timestamp]
```

### 2.3 Exceeded Limits
Requests exceeding rate limits receive:
- HTTP 429 "Too Many Requests" response
- Retry-After header indicating when to retry

### 2.4 Limit Adjustments
We reserve the right to adjust rate limits with 14 days' notice. Emergency adjustments may occur without notice for service protection.

## 3. Usage Restrictions

### 3.1 Permitted Use
You may use the API to:
- Display truck data in your applications
- Process vehicle information for business operations
- Build integrations with your systems
- Generate reports and analytics

### 3.2 Prohibited Uses
Without explicit written permission, you may NOT:
- Resell raw API data
- Create a public database of TruckPedia data
- Use data for machine learning model training
- Cache significant portions of data locally
- Exceed rate limits through any means
- Access endpoints beyond your plan's allocation

## 4. Redistributable Data

### 4.1 Limited Redistribution
You MAY display individual vehicle data points retrieved from the API in:
- Your application's user interface
- Customer-facing reports (limited quantities)
- Professional documents for your clients

### 4.2 Redistribution Prohibited
You may NOT:
- Publish raw API responses publicly
- Create derivative databases
- Redistribute via CDN or mirror services
- Include data in software distributions
- Sell or license retrieved data

### 4.3 Attribution
When displaying data, attribution is appreciated but not required for individual lookups. Bulk data displays or derivative works may require attribution at our discretion.

## 5. Service Level Expectations

### 5.1 Uptime Target
TruckPedia targets **99.9% API availability** per calendar month ("Service Level").

### 5.2 Exclusions
Downtime for the following is NOT counted against Service Level:
- Scheduled maintenance (notice provided when possible)
- Force majeure events
- Third-party service failures beyond our control
- DDoS attacks or security incidents
- Beta or development endpoints

### 5.3 SLA Credits
For paid plans only, if actual uptime falls below 99.9% in a calendar month, you may request a service credit:

| Monthly Uptime | Credit |
|----------------|--------|
| 99.0% – 99.89% | 5% of monthly fee |
| 95.0% – 98.99% | 15% of monthly fee |
| Below 95.0% | 25% of monthly fee |

Credits are applied to future invoices. Maximum credit: 25% of monthly fee.

### 5.4 SLA Claims
To claim a credit, submit a request within 30 days of the affected month with documentation of downtime. Claims submitted after 30 days are not accepted.

## 6. API Changes

### 6.1 Versioning
We version our API to manage changes:
- Current stable: v1
- Breaking changes require a new major version
- Non-breaking changes may be applied without version increment

### 6.2 Deprecation
- Endpoints or features may be deprecated with 90 days' notice
- Deprecated features remain functional for the notice period
- We will provide migration guidance when available

### 6.3 Sunset Policy
Major version support is maintained for a minimum of 24 months after a new major version release.

## 7. Support

### 7.1 Basic Support
All accounts:
- Documentation and API reference
- Community resources
- Email support for billing issues

### 7.2 Priority Support
Pro plan users receive:
- Response within 24 hours (business days)
- Priority ticket handling

### 7.3 Support Inquiries
For API technical support: api-support@truckpedia.com

## 8. Monitoring and Analytics

### 8.1 Usage Monitoring
We monitor API usage for:
- Billing calculations
- Rate limit enforcement
- Performance optimization
- Abuse detection

### 8.2 Application Performance
We may collect anonymized metrics about how your application uses the API to improve our service. No sensitive application data is stored.

## 9. Bulk Access

### 9.1 Batch Endpoints
Some plans may include batch or bulk endpoints for efficient retrieval of multiple records. These endpoints have separate, higher rate limits.

### 9.2 Data Exports
If available, data exports are subject to the same redistribution restrictions as live API data.

## 10. Compliance

You are responsible for ensuring your use of the API complies with:
- Applicable laws and regulations
- Industry requirements specific to your use case
- Data protection requirements (GDPR, CCPA, etc.) for data you process

## 11. Emergency Conditions

Under extreme circumstances (security threats, legal requirements, system failures), we may:
- Immediately restrict access to prevent harm
- Modify or suspend features without notice
- Implement temporary emergency limits

We will communicate changes as soon as reasonably possible.

## 12. Contact

For API-related questions: api-support@truckpedia.com

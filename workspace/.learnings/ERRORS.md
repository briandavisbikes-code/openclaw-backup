# Errors Log

Command failures, exceptions, and unexpected behaviors.

---

## 2026-03-25 Team Agent Errors

### lt-market-scan (8:30 AM)
- Status: error, lastDurationMs: 201433
- Likely timeout or API failure during market scan
- 1 consecutive error

### 1stclass-daily (9:00 AM)
- Status: error, lastDurationMs: 229300
- Likely timeout reaching Mission Control or TruckPedia health check
- 1 consecutive error

**Action needed:** Investigate why isolated agent sessions are timing out for team reports. May need shorter timeouts or retry logic.

---

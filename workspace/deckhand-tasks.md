# Deckhand Tasks
*Assigned by Commander via #captain channel, 2026-04-14 21:05 PDT*

## Active Task: DeepSeek Cost & Reliability Monitoring
**Priority:** High  
**Status:** Assigned  
**Due:** Ongoing (daily check)

### Objective
Ensure DeepSeek V3 usage stays under **$0.23/day** target and API reliability issues (timeouts) are addressed.

### Responsibilities
1. **Daily balance check** – Run `check-deepseek-balance.py` at 8:05 AM (cron exists)
2. **Cost tracking** – Log daily spend, alert if > $0.23/day
3. **API health monitoring** – Check for timeout errors in gateway logs
4. **Model performance** – Verify `deepseek/deepseek-chat` switch improves reliability
5. **Alerting** – Notify #captain if:
   - Balance < $5
   - Daily spend > $0.30
   - Timeout errors > 3/day
   - API response time > 10s average

### Tools & Scripts
- `check-deepseek-balance.py` – Balance + daily rate calculation
- `system-monitor.py` – General health (includes cron errors)
- Gateway logs – `~/.openclaw/logs/gateway.err.log`

### Reporting
- **Morning brief** – Include DeepSeek balance & daily rate
- **Weekly summary** – Sunday 6 PM PT (with Gunner crypto report)

### Background
- **Previous model:** `deepseek/deepseek-reasoner` – caused frequent timeouts
- **Current model:** `deepseek/deepseek-chat` – switched 2026-04-14 9:02 PM
- **Security fix:** Discord allowlist configured, warnings resolved
- **System-monitor:** Restored (runs every 3 hours)

---

## Task History
- **2026-04-13:** Deckhand assigned to monitor DeepSeek balance (MEMORY.md)
- **2026-04-14:** Model switch due to timeout issues
- **2026-04-14:** Formal task assignment created

---

*Updated automatically when tasks change.*
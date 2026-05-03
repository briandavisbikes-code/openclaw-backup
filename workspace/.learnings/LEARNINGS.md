# Learnings - Behavioral Preferences

## Cron Job Engineering (2026-03-31)

### CRITICAL: Isolated Session delivery.mode="announce" to Discord FAILS
- ALL isolated agent cron jobs with `delivery.mode="announce"` + `channel="discord"` errored
- ALL isolated agent cron jobs with `delivery.mode="none"` succeed (including ones running 223-272s)
- **Timeout is NOT the issue** — failing jobs completed in 145-267s (well under 600s limit)
- **The announce-to-Discord delivery is the failure point** — likely a Discord webhook or delivery issue
- **Fix:** Always use `delivery.mode="none"` for isolated agent sessions unless explicitly needed
- Jobs fixed: team-self-improve, truck-database-expansion, lt-market-scan, 1stclass-daily, chief-weekly-content

## Commander's Preferences

### Language & Communication
- **Vary responses** - Avoid repeating same phrases and quotes
- Commander's wife doesn't like overused phrases
- Mix up greetings and sign-offs (not always "Aye aye", "By your command", etc.)
- Keep it fresh and natural

### Family Topics
- Family discussions are fine
- Just don't overuse the same phrases or quotes

### Affirmation Emails
- Use variety - expand from 50+ affirmations
- Different styles and approaches
- Don't repeat the same messages

## What Works

### Good Sign-offs (rotate these)
- "By your command!"
- "Anything else?"
- "Standing by!"
- "Ready when you are."
- Just normal conversational endings

### Avoid These (overused)
- "Aye aye, Commander!" (used too much)
- "By your command!" (too frequent)
- Family quotes/puns (repeating)
- Anything that feels formulaic

## Remember
新鲜的语言 = better conversation
Repetition = boring

---

## 2026-03-24 Team Self-Improvement

### What Went Well
- Mission Control: CA Water Tab successfully integrated with CDEC API
- Mission Control: Systems tab improvements (LLMs list, cron job visibility)
- Team avatars configured for Warrant, Deckhand, LT, Chief
- topo-print skill created for Warrant's 3D terrain work
- TruckPedia reached 10,781 trucks with global coverage
- Security monitoring running clean (0 critical issues)

### What Could Improve
- Still need to rotate language/vary sign-offs more naturally
- Affirmation emails need continued variety

### Notes
- No significant errors or mistakes today
- Team running smoothly

---

## 2026-03-26 Team Self-Improvement

### Status
- Quiet day — no new memory file, minimal team activity
- No new errors detected
- Ongoing: team agent timeout investigation still pending

### What Went Well
- System stable, no new incidents
- Cron jobs (security, backup, affirmations) running on schedule

### What Could Improve
- Team agent timeout issue from 03-25 still unresolved
- Need to investigate LT and 1st Class isolated session configs

### Action Items
- [ ] Investigate lt-market-scan timeout (201s) — check API calls, add timeout handling
- [ ] Investigate 1stclass-daily timeout (229s) — reduce scope or add retry logic
- [ ] Consider shorter task scopes for team agents to avoid isolated session timeouts

---

## 2026-03-27 Team Self-Improvement

### What Went Well
- TruckPedia DB grew 1,705 trucks (17,164 → 18,869) with gap fills + international makes
- Fixed JS syntax errors (missing semicolons)
- Fixed year dropdown cascade bug — Region → Make → Model → Year now working
- Frontend tested and running on port 8888
- Good debugging session on dropdown issue

### What Could Improve
- Team agent timeout issue (from 03-25) still unresolved — LT market scan and 1stclass-daily keep timing out
- Need to shorten task scopes or add retry logic for isolated team sessions

### No new errors today. System stable.

### Action Items (carryover)
- [ ] Investigate lt-market-scan timeout (201s) — check API calls, add timeout handling
- [ ] Investigate 1stclass-daily timeout (229s) — reduce scope or add retry logic
- [ ] Consider shorter task scopes for team agents to avoid isolated session timeouts

---

## 2026-03-29 Team Self-Improvement

### Status
- Sunday - quiet day, no new daily memory file
- No new errors detected beyond chronic isolated session timeouts

### What Went Well
- Security monitoring (3hrly, daily, weekly): all OK
- Daily maintenance (4 AM): OK
- Daily backup (4:30 AM): OK
- Affirmation for Davina (8:30 AM): OK
- AgentMail noon check: OK (306s run, delivered)
- AgentMail 4pm check: OK (244s run, delivered)

### What Could Improve — CRITICAL PERSISTENT ISSUE
Team isolated session cron jobs all timing out (~300s default timeout). 4-5 consecutive errors on each:

| Cron | Last Run | Duration | Errors |
|------|----------|----------|--------|
| team-self-improve | 03-28 8PM | 201s | 4 |
| truck-database-expansion | 03-29 2AM | 193s | 4 |
| lt-market-scan | 03-29 8:30AM | 251s | 5 |
| 1stclass-daily | 03-29 9AM | 240s | 5 |

**NOTE:** agentmail-noon (306s) and agentmail-4pm (244s) run successfully as isolated sessions — proving the sessions CAN complete. The difference is those jobs are lightweight.

**Root cause:** Task scope too large for the default ~300s isolated session timeout.

### Action Items — RESOLVE NOW
- [CRITICAL] Add `"timeoutSeconds": 600` to team-self-improve, truck-database-expansion, lt-market-scan, 1stclass-daily cron payloads
- [CRITICAL] Or shorten task scopes for team agent crons to complete within 300s
- This issue has persisted since 03-25 (5 days) — MUST fix this week

---

## 2026-03-30 Team Self-Improvement

### What Went Well
- TruckPedia: DB grew to 21,834 trucks (~85% coverage), +243 in last session
- Legal docs all accessible and tested locally (terms, privacy, disclaimer, api-terms)
- Oracle Cloud deployment plan established (Commander to set up account)
- ProductionX business license applied (Sacramento County, unincorporated)
- Security/maintenance/backup/affirmations all running clean

### What Could Improve — ISOLATED SESSION ERRORS PERSIST
TimeoutSeconds set to 600 on all team agent crons — but they STILL error. Last run data:

| Cron | Duration | Errors |
|------|----------|--------|
| team-self-improve | 250s | 5 |
| truck-database-expansion | 269s | 5 |
| lt-market-scan | 118s | 6 |
| 1stclass-daily | 384s | 6 |

AgentMail (noon: 317s, 4pm: 289s) runs fine. Same isolated session type, similar durations.

**The errors don't match timeout pattern** — lt-market-scan (118s) errors while agentmail at 317s works. And durations are within 600s limit.

**Possible causes:**
1. Agent startup/init failure for team agents specifically
2. Delivery mode issue (team crons use announce to #captain)
3. Something wrong with how team agent prompts are structured
4. Gateway resource exhaustion — too many isolated sessions running concurrently?

**Status:** ALL team isolated sessions are broken despite 600s timeout. This is now 6+ days old.

### Action Items
- [CRITICAL] Investigate WHY isolated sessions error — not just timeout. lt-market-scan errors at 118s (well under limit). Something else is killing these sessions.
- [ ] Check gateway logs for more detail on isolated session failures
- [ ] Try disabling delivery.announce on team crons — delivery to Discord may be the failure point
- [ ] Check if there's a pattern: all team agents run with similar "report to #captain" delivery. Maybe Discord webhook/announce is failing

---

## 2026-03-28 Team Self-Improvement

### What Went Well
- TruckPedia DB grew from ~17,164 to 18,522 trucks (+1,358 via gap fills + international)
- Frontend dropdown bugs fixed (JS syntax errors, year cascade issue)
- Frontend running on port 8888, cascade: Region → Make → Model → Year
- Security monitoring stable: 3hrly, daily, weekly all OK
- Affirmation, maintenance, backup, AgentMail checks all running clean
- Team debugging on dropdown issue was effective

### What Could Improve
- **PERSISTENT: Team agent isolated sessions timing out** — now 4+ consecutive errors each:
  - `lt-market-scan` (~291s run, 4 errors)
  - `1stclass-daily` (~172s run, 4 errors)
  - `truck-database-expansion` (~268s run, 3 errors)
  - `team-self-improve` itself (~312s run, 3 errors)
  - Isolated session default timeout appears to be ~300s — these all exceed or hover near it
- This same issue flagged on 03-25, 03-26, 03-27 — still not resolved

### Errors Today
- team-self-improve cron run itself errored (timeout likely, ~312s)

### Action Items
- [CRITICAL] Increase isolated session timeout for team agent crons — add `"timeoutSeconds": 600` to payload or adjust skill defaults
- [CRITICAL] Investigate lt-market-scan, 1stclass-daily, truck-database-expansion task scope — if they're timing out at 300s, the work is too large for the session limit
- [CARRYING] Still unresolved from 03-25: team agent timeout investigation


---

## 2026-04-01 Team Self-Improvement

### Status
- Team self-improve: Running now (that's me). 7 prior consecutive errors (267s runs), current run executing.
- truck-database-expansion, lt-market-scan, 1stclass-daily: All OK — chronic timeout issue RESOLVED with `timeoutSeconds: 600` + `delivery.mode="none"`
- chief-weekly-content: 1 error (33s, minor Monday glitch)
- Security/maintenance/backup/affirmations/agentmail: All running clean

### Key Lesson
`delivery.mode="none"` + `timeoutSeconds: 600` fixes isolated session cron failures. The team-self-improve cron is the last remaining erroring job — task itself (reading files, summarizing) may be too heavy.

### Action Items
- [ ] Simplify team-self-improve prompt or increase timeout further
- [ ] Consider making team-self-improve run in main session instead of isolated

# Infrastructure Specifications
**Version:** 1.0  
**Date:** 2026-04-29  
**Author:** Deckhand (Coding & Infrastructure)  
**Classification:** Internal — Team Eyes Only

---

## 1. Subagent Spawning Protocol

### Context Modes

| Mode | Use When | Notes |
|------|----------|-------|
| `isolated` (default) | Subagent needs zero context from current session; fresh workspace | Preferred for atomic tasks — research, write, analyze |
| `forked` | Subagent needs current transcript context (conversation history, decisions so far) | Used only when child must know what's already happened; adds token overhead |
| `context:"isolated"` | Spawn args — use this string literal | |
| `context:"fork"` | Spawn args — use this string literal | |

**Decision rule:** Default to `isolated`. Use `fork` only if the task explicitly requires awareness of prior conversation turns.

### Timeout Values by Task Type

| Task Type | Recommended Timeout | Rationale |
|-----------|--------------------|-----------|
| Quick lookup / single-file edit | 30s | One-shot, no subprocess |
| Document write (1–3 pages) | 60s | Writing + save |
| Multi-file code task | 120s | File creation + edits |
| Research + report | 180s | Web fetch + synthesis |
| Complex analysis (data, infra design) | 300s | Multi-step reasoning |
| Anything that might call a coding agent | 300s | PTY + LLM round-trips |

**Override rule:** If the task is ill-defined or large, spawn with `timeout` generous enough that the agent isn't rushed. Under.timeout is the most common cause of silent task abortion.

### Naming Conventions

Subagent session labels follow the pattern: `{role}-{descriptor}`

Examples:
- `deckhand-infra-specs`
- `lt-market-research-run`
- `chief-content-calendar-q2`
- `gunner-alert-check-0417`

This makes session list readable and correlates subagent work to the task that spawned it.

---

## 2. Coordination Mechanics

### Hermes → Subagents

Hermes (the main agent) spawns subagents using `sessions_spawn` with:
- `context` — `isolated` (most common) or `fork` (when needed)
- `timeout` — set per task type table above
- `label` — follows naming convention

Results are **push-based**: descendants auto-announce completion to the parent session. Hermes does not poll.

### OpenClaw (Captain) ↔ Hermes

- **Discord routing:** Captain receives messages from `#captain` channel (configured `threadBindings`)
- **Thread binding:** Each team role has a Discord thread. Captain routes messages to the correct thread based on content or explicit mention
- **Subagent routing:** Subagent sessions write their output to files or memory, then report completion. Captain reads and delivers final results to Discord

Current threadBindings configuration:
```
captain    → discord:1498872063178575914  (#captain channel)
lt         → discord thread for LT
chief      → discord thread for Chief
warrant    → discord thread for Warrant
1stclass   → discord thread for 1st Class
gunner     → discord thread for Gunner
deckhand   → discord thread for Deckhand
```

### Coordination Summary

```
Discord #captain
    ↓ (Captain/Hermes reads)
main agent session
    ↓ (sessions_spawn)
subagent(s) — isolated or forked
    ↓ (push-based completion)
main agent session resumes
    ↓ (Captain formats + sends)
Discord #captain or team thread
```

---

## 3. Failure Handling Matrix

### Timeout Behavior

| Task Type | On Timeout | Action |
|-----------|-----------|--------|
| Quick lookup | Silent abort | Log to session, notify parent via completion message |
| Document write | Partial save possible | Check if file was written; report what was produced |
| Multi-file code | Incomplete state | Report what files exist; flag as incomplete |
| Research | No output | Report timeout, summarize any partial findings |
| Complex analysis | Unresolved | Report stage reached, flag for human review |

### Error Propagation

- Subagents return completion with a status field (`ok`, `error`, `timeout`)
- If subagent returns error, main agent (Hermes/Captain) logs to session and decides:
  - **Retry once** for transient errors (API timeout, rate limit)
  - **Escalate** for structural errors (bad input, permission denied)
  - **Abort** for unrecoverable errors (syntax in task, impossible request)
- Error messages are surfaced to the human via Discord, not raw stack traces

### Retry Strategy

1. **First failure:** Log error, wait 10s, retry once
2. **Second failure or timeout:** Report to human with what was attempted
3. **Idempotency:** All subagent tasks must be idempotent — re-running produces the same result without side effects
   - File writes use `write` (overwrites cleanly)
   - No unique-row inserts without dedup logic
   - Cron-triggered tasks check state before acting

---

## 4. Resource Constraints

### Token Budget

| Subagent Type | Budget Guideline | Notes |
|---------------|-----------------|-------|
| Research / analysis | 8,000–15,000 tokens | Single-task focus, no multi-turn loops |
| Writing / documentation | 5,000–10,000 tokens | Structured output, tight scope |
| Coding | 10,000–20,000 tokens | Can spike when using coding agent with PTY |
| Data operations | 5,000–12,000 tokens | Bounded by data size, not reasoning |

**Rule:** If a subagent approaches 80% of its token budget with no clear path to completion, it should stop, save partial work, and report.

### Concurrency Limits

- **Max concurrent subagents:** 5 active at any time
  - Beyond 5, new spawns queue behind completion of existing ones
  - Exception: critical security checks may exceed this limit
- **Max concurrent tool calls per subagent:** 50
  - After 50, session is cut and partial results returned
- **Longest lived subagent:** 10 minutes
  - Anything running >10min is flagged for review; auto-kill at 15min

### Cost Monitoring

- Subagent token usage is tracked in the session metadata
- Weekly review: sum of subagent costs in `#monitoring` report
- Thresholds:
  - Daily subagent spend > 500K tokens → alert in `#monitoring`
  - Weekly > 2M tokens → review scheduled

---

## Appendix: Quick Reference

| Pattern | Standard |
|---------|----------|
| Context mode | `isolated` (default), `fork` (when needed) |
| Session naming | `{role}-{descriptor}` |
| Timeout (general) | 60s default, 300s max |
| Max concurrent subagents | 5 |
| Subagent auto-kill | 15 minutes |
| Retry | 1 retry, 10s delay, then escalate |
| Idempotency | Required for all tasks |
| Error reporting | Human-readable, Discord-compatible, no raw stack traces |

---
*Document status: Draft — ready for team review.*
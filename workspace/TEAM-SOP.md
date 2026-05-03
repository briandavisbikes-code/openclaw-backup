# Team SOP — Parallel Workstream Architecture

**Version:** 1.0  
**Date:** 2026-04-29  
**Commander:** Brian  
**Status:** APPROVED

---

## 🎯 Overview

Multi-agent parallel workstream system where Hermes coordinates, OpenClaw executes, and specialized subagents handle deep-dive research simultaneously. All output feeds into a unified briefing for the Commander.

---

## 🏗️ Architecture

```
Commander Request
       ↓
    Hermes (Supervisor/Coordinator)
    /    |    \    \
 LT   Chief  1st  Deckhand  ← Subagents fan out (isolated)
    \    |    /    /
     OpenClaw (Executor) ← Tools, browsing, skills
       ↓
   Unified Output → Commander
```

### Roles

| Role | Agent | Responsibility |
|------|-------|----------------|
| Supervisor | Hermes | Task decomposition, fan-out, aggregation |
| Executor | OpenClaw (Captain) | Tool execution, browsing, file operations |
| Research | LT | Intel gathering, market analysis |
| Packaging | Chief | Content strategy, output formatting |
| Design/UI | 1st Class | Visualization, UX, dashboard concepts |
| Infrastructure | Deckhand | Backend coordination, subagent lifecycle |
| Crypto | Gunner | Crypto vertical (separate workstream) |
| 3D/Technical | Warrant | Technical execution, 3D printing |

---

## 🔄 Standard Workflow

1. **Commander submits task** to #hermes-vc or #captain
2. **Hermes decomposes** task into research and execution chunks
3. **Fan-out:** Subagents spawn in parallel (isolated sessions)
4. **OpenClaw executes** tool-based work simultaneously
5. **Fan-in:** Subagents yield results via push-based completion
6. **Hermes aggregates** into structured Mission Brief
7. **Delivery** to Commander via appropriate channel

---

## 📦 Standard Output Format

Daily Mission Brief (≤500 words):

```
**MISSION BRIEF — [DATE]**

🎯 Completed: [3 bullets max]
⚠️ Blockers: [needs Commander input]
📋 Tomorrow: [3 bullets]
💡 Wins: [what went well]
```

Per-agent status format:
```
**Agent** — Status ● | Last active: [time]
└─ Current task: [description]
```

---

## 📊 Dashboard Concept (1st Class)

**Mission Control Lane View:**

- ● Active — currently working
- ◐ Dormant — waiting on trigger
- ⬤ Complete — awaiting review
- ○ Queued — next task ready

**Metrics tracked:**
- Tasks completed
- Time on task (detects stuck agents)
- Tasks in queue
- Error rate
- Output freshness

---

## ⚙️ Infrastructure (Deckhand)

### Subagent Lifecycle

- **Spawn:** `sessions_spawn` with isolated context (default)
- **Fork:** `context:"fork"` only when child needs parent transcript
- **Cleanup:** Ephemeral by design — spawn, yield, terminate
- **Completion:** Push-based via `sessions_yield` — no polling

### Resource Management

- Token limits: Independent per subagent
- Concurrency: Multiple parallel subagents supported
- Context copying: Expensive — use sparingly

### Failure Handling

- Timeout: Configurable per subagent (30-60s typical)
- Error propagation: Bubbles to parent via yield
- Partial failure: Continues independently
- Retry: Re-spawn idempotent with same task
- No zombie agents: Background exec via `process` tool

---

## 👥 Role Cards

*To be completed by Chief — draft template:*

**Role:** [NAME]
**Mission:** [One sentence]
**Tools:** [List]
**Escalation:** [Who/where]
**Daily format:** [Input/output standard]
**Handoff protocol:** [How to wrap and transfer]

---

## ⚠️ Key Risks

1. **Cost compounding** — Watch token burn rate at scale
2. **Over-parallelization** — Don't spin up 20 agents for one task
3. **Aggregation failure** — Build aggregation strategy from day one
4. **Security surface** — Each agent boundary is a potential exploit point
5. **Tool sprawl** — Keep agents narrow; multi-agent fixes what tool sprawl breaks

---

## 🔧 Channel Routing

| Channel | Purpose | Agents |
|---------|---------|--------|
| #captain | General updates, security, maintenance | Captain |
| #hermes-vc | Hermes coordination, team comms | Hermes |
| #truckpedia-net | TruckPedia project only | All |
| Other channels | Per project/topic | Assigned agent |

---

## 📝 Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-04-29 | Initial approval |

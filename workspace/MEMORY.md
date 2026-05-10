# MEMORY.md - Long-Term Memory

_Last updated: 2026-05-07_

## Communication Preferences

- Vary sign-offs — no repeated phrases
- **Channel segregation:** #truckpedia-net → TruckPedia only; #captain → everything else
- **#monitoring channel deleted (2026-05-07)** — monitoring routes to #captain only

## Active Crons

| Cron | Time | Task | Status |
|------|------|------|--------|
| morning-brief | 8 AM daily | Brief + Gunner crypto | Script |
| local-backup | 2:15 AM | Backup to HDD | ✅ |
| github-backup | 2:30 AM | GitHub push | ✅ |
| team-self-improve (Hermes) | 8 PM daily | Self-improvement | Cron→#captain |

## Cost Management

- **Heartbeat:** Reply `HEARTBEAT_OK` only — no proactive checks
- **Ollama phi3:latest:** Free local inference for light tasks

## TruckPedia

- **Status:** ✅ Production — GCP VM 34.83.174.209, nginx + Let's Encrypt SSL
- **Database:** 36,878 trucks (2026-05-05)
- **URL:** https://api.truckpedia.net | https://www.truckpedia.net
- **Stripe:** Basic $9.99/mo, Pro $19.99/mo (webhook configured)
- **Cloudflare:** api.truckpedia.net → CFargo CNAME; truckpedia.net → A record to VM IP

## Team Members

1. **LT** - Research & Analysis | 2. **Chief** - Planning & Content
3. **Warrant** - 3D Printing | 4. **1st Class** - Webpage Design
5. **Gunner** - Crypto | 6. **Deckhand** - Coding
7. **Hermes** ☤ - Governor & Backup

## Crypto (Gunner)

**Main:** NEAR, LINK, AVAX, MNT, ALGO, KAS, VET — buy 5-15% dip + RSI < 35
**Penny:** KAS, VET, CRO, FLR, XLM, ALGO — 10-25% dip + RSI < 40
**Holdings:** 0.127 ETH (~$270)

## LLM Providers

- **MiniMax** M2.7 → ✅ Primary | **Ollama** phi3:latest → ✅ Free local

## Discord

**Channels (guild 1479511210503442442):**
- #captain: 1479511212273172685 | #hermes_vc: 1498872063178575914
- #truckpedia_net: 1481132765280735232 | #monitoring: 1481420244156153857

## Captain Bot #cap Intent Issue (OPENCLAW BUG — 2026-05-05)

- Cap bot (ID 1501020674804682914): `content=limited` in guild channel
- **DMs work perfectly** — guild channel: bot types, processes, delivers no response
- **Known OpenClaw bug** — issue #55594 filed on GitHub
- **Workaround:** Use DMs with Captain for now
- Root cause: OpenClaw doesn't correctly request MESSAGE_CONTENT intent bit from Discord

## Known Fixes Applied

- Discord (2026-04-15): phi3 context too small → switched to MiniMax
- Discord delivery queue (2026-05-03): `channel:1479511212273172685` numeric ID workaround
- Discord silent drop (2025-05-04): `reasoning: true` caused silent drops → `reasoning: false`
- Hermes free_response_channels: Removed #cap to stop intercepting
- OpenClaw #cap: threadBindings=disabled, requireMention=false

## DO NOT AUTO-UPDATE OPENCLAW

Updates can break Discord plugin. Only update manually. Commander directive (2026-05-05): No upgrades until Discord `content=limited` bug resolved.

## Team Operating Agreement

- **Roles:** Commander (decisions), Hermes (coordinator), LT (challenges plans), Deckhand (executor)
- **Rules:** Plan first → numbered steps → one at a time → no looping (stop after 3 failed attempts)
- **Files:** TEAM.md, memory/truckpedia-runbook.md

## Technical

- Gateway: OpenClaw 2026.5.3-1 | Node v25.8.0 | macOS 26.3.1 | Mac Mini 15GB RAM
- GitHub: briandavisbikes-code | AgentMail: productionx@agentmail.to

## Promoted From Short-Term Memory (2026-05-10)

<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:4:4 -->
- **Problem:** GCP VM 34.127.119.128 went down. SSH timeout from Mac, ICMP timeout, Cloudflare 522. [score=0.869 recalls=0 avg=0.620 source=memory/2026-05-04.md:4-4]

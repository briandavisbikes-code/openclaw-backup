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
- OpenClaw #cap: threadBindings=disabled, requireMention=true (was false, broken since 5.2, not fixed in 5.7)

## DO NOT AUTO-UPDATE OPENCLAW

Updates can break Discord plugin. Only update manually. Commander directive (2026-05-05): No upgrades until Discord `content=limited` bug resolved.

## Team Operating Agreement

- **Roles:** Commander (decisions), Hermes (coordinator), LT (challenges plans), Deckhand (executor)
- **Rules:** Plan first → numbered steps → one at a time → no looping (stop after 3 failed attempts)
- **Files:** TEAM.md, memory/truckpedia-runbook.md

## Technical

- Gateway: OpenClaw 2026.5.7-1 | Node v25.8.0 | macOS 26.3.1 | Mac Mini 15GB RAM
- GitHub: briandavisbikes-code | AgentMail: productionx@agentmail.to

## Promoted From Short-Term Memory (2026-05-10)

<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:4:4 -->
- **Problem:** GCP VM 34.127.119.128 went down. SSH timeout from Mac, ICMP timeout, Cloudflare 522. [score=0.869 recalls=0 avg=0.620 source=memory/2026-05-04.md:4-4]

## Promoted From Short-Term Memory (2026-05-11)

<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:15:15 -->
- **Download URL (public):** `https://raw.githubusercontent.com/briandavisbikes-code/truckpedia-data/main/trucks.json` [score=0.896 recalls=0 avg=0.620 source=memory/2026-05-04.md:15-15]
<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:17:17 -->
- **Upload:** Created new public repo `truckpedia-data` with 36,078 trucks (14.8MB JSONL) [score=0.896 recalls=0 avg=0.620 source=memory/2026-05-04.md:17-17]
<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:19:19 -->
- **Channel:** Commander confirmed - I (Captain) only respond in #truckpedia-net, Hermes stays in #hermes_vc [score=0.896 recalls=0 avg=0.620 source=memory/2026-05-04.md:19-19]
<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:23:23 -->
- **TruckPedia VM (34.127.119.128) Status:** [score=0.886 recalls=0 avg=0.620 source=memory/2026-05-04.md:23-23]

## Promoted From Short-Term Memory (2026-05-12)

<!-- openclaw-memory-promotion:memory:memory/2026-05-05.md:22:25 -->
- sudo /opt/node/lib/node_modules/pm2/bin/pm2 start /home/your-email/api/ecosystem.config.js [score=0.884 recalls=0 avg=0.620 source=memory/2026-05-05.md:50-51]

## Promoted From Short-Term Memory (2026-05-13)

<!-- openclaw-memory-promotion:memory:memory/2026-04-23.md:1:11 -->
- ## Truck Database Expansion - 2026-04-23 02:00 AM - Cron job triggered (fbae380f-49e9-4058-983b-97a78eaefd58) - **Initial run:** Only added 50 trucks (TARGET_COUNT=50 bottleneck) - **Fix applied:** Changed TARGET_COUNT from 50 → 400 - **Second run:** Added 400 trucks ✅ - Database: 28,622 → 31,678 trucks - HP fill: 0 (already complete) - JSON export: trucks.json updated (31,678 entries, 14MB) - **⚠️ GCP VM sync broken:** SCP uses placeholder "your-email@" — needs username fix. JSON is available locally. [score=0.877 recalls=5 avg=0.491 source=memory/2026-04-23.md:1-11]

## Promoted From Short-Term Memory (2026-05-17)

<!-- openclaw-memory-promotion:memory:memory/2026-04-14.md:54:87 -->
- - **Report sent:** GitHub repository briandavisbikes-code/openclaw-backup ## Security Check - 2026-04-14 06:02 AM - 3‑hourly security audit completed - **0 critical** findings ✅ - **5 warnings** (all expected): 1. gateway.trusted_proxies_missing (skip per USER.md) 2. gateway.controlUi.allowInsecureAuth=true (local debugging) 3. config.insecure_or_dangerous_flags (same) 4. security.trust_model.multi_user_heuristic (skip) 5. channels.discord.commands.native.no_allowlists (skip) - No action required; system secure ## Weekly Content Plan - 2026-04-14 07:42 AM - Generated weekly content plan for TruckPedia, Mission Control, social media. - Sent to Discord #captain channel (1479511212273172685). - Plan includes: TruckPedia blog posts, Mission Control tool development, social media campaign. - Action items assigned to team members. ## Weekly Content Plan (Cron) - 2026-04-14 07:55 AM - Generated fresh weekly content plan via chief-weekly-content cron. - Sent to Discord #captain channel (1479511212273172685). - Focus: TruckPedia blog posts, Mission Control Twitter API, social media calendar. - Team assignments: Chief (content), 1st Class (design), Deckhand (dev), LT (research). # 2026-04-14 ## Security Check - 2026-04-14 00:02 AM - 3‑hourly security audit completed - **0 critical** findings ✅ - **5 warnings** (all expected): 1. gateway.trusted_proxies_missing (skip per USER.md) 2. gateway.controlUi.allowInsecureAuth=true (local debugging) 3. config.insecure_or_dangerous_flags (same) 4. security.trust_model.multi_user_heuristic (skip) [score=0.893 recalls=4 avg=0.752 source=memory/2026-04-14.md:54-87]
<!-- openclaw-memory-promotion:memory:memory/2026-05-04.md:1:34 -->
- ## TruckPedia VM Restore (2026-05-04) **Problem:** GCP VM 34.127.119.128 went down. SSH timeout from Mac, ICMP timeout, Cloudflare 522. **Resolution:** - VM was rebooted by Commander (via GCP console) - Site root: `/home/briandavisbikes/api/public` - trucks.json: `/home/briandavisbikes/api/public/api/trucks.json` - Home dir: `/home/briandavisbikes/` (not `/home/briandavisbikes@gmail.com/`) - Nginx running on VM ✅ - Homepage count updated to 36,078 ✅ - No git/wget on VM — used curl + GitHub API **Download URL (public):** `https://raw.githubusercontent.com/briandavisbikes-code/truckpedia-data/main/trucks.json` **Upload:** Created new public repo `truckpedia-data` with 36,078 trucks (14.8MB JSONL) **Channel:** Commander confirmed - I (Captain) only respond in #truckpedia-net, Hermes stays in #hermes_vc ## End of Session Notes (Captain - 2026-05-04) **TruckPedia VM (34.127.119.128) Status:** - VM was rebooted tonight — SSH reachable again from VM console, not from Mac (SSH still times out from outside) - Nginx running ✅ - trucks.json needs to be restored — download command ready, just run it **Tomorrow's Tasks:** 1. On VM console, run: `curl -sL "https://raw.githubusercontent.com/briandavisbikes-code/truckpedia-data/main/trucks.json" > /home/briandavisbikes/api/public/api/trucks.json && wc -l /home/briandavisbikes/api/public/api/trucks.json` 2. Then: `sed -i 's/31,678/36,078/g' /home/briandavisbikes/api/public/index.html` 3. Verify site: `curl -s http://localhost/ | grep -o '[0-9,]* trucks'` **Channel Segregation Reminder:** - Captain (me) → #truckpedia-net ONLY [score=0.878 recalls=4 avg=0.518 source=memory/2026-05-04.md:1-34]

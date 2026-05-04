# Issue: Discord Channel Alias "captain" Not Resolved in Delivery Queue

**Date:** 2026-05-03  
**Severity:** High  
**Status:** Mitigated (workaround applied) — Root cause unfixed

## Summary

When cron jobs or delivery-queue entries use `to: "channel:captain"`, the Discord plugin
fails to resolve the alias `"captain"` to a numeric channel ID, resulting in **"Invalid Form Body"**
errors on every delivery attempt.

## Symptoms

- 17 pending deliveries in `~/.openclaw/delivery-queue/*.json` all failing with `Invalid Form Body`
- Manual sends to `channel:captain` also fail with "Discord recipient is required" in gateway logs
- Discord status shows OK (connected, inbound working) but outbound cron notifications silently fail

## Root Cause

The Discord plugin's `target-resolver.ts` uses live directory lookups for usernames, but
`parseDiscordTarget()` in `target-parsing.ts` treats a bare alphanumeric string like `"captain"`
as a **channel name** and passes it directly to the API without resolving it to a numeric ID.

Discord's API requires numeric channel IDs in the `channel_id` field — it does not accept
channel names or aliases.

## Workaround Applied

Replaced `"channel:captain"` with `"channel:1479511212273172685"` in all 17 delivery queue files:

```bash
for f in ~/.openclaw/delivery-queue/*.json; do
  python3 -c "
import json
with open('$f') as fh: d = json.load(fh)
if d.get('to') == 'channel:captain':
    d['to'] = 'channel:1479511212273172685'
    with open('$f', 'w') as fh: json.dump(d, fh)
    print('Fixed: $f')
"
done
```

## Proper Fix Required

The Discord plugin needs a **channel alias resolution step** before sending. Options:

1. **Add alias table to `channels.discord` config** — e.g., `aliases: { captain: "1479511212273172685" }`
2. **Resolve aliases in `parseDiscordTarget()`** — check a configured alias map before passing to API
3. **Resolve aliases in `sendMessageDiscord()`** — intercept `to` string and resolve before `resolveChannelId()`
4. **Or**: Configure all cron job deliveries to use numeric channel IDs directly (no aliases)

## Config Change Needed

In `~/.openclaw/openclaw.json` under `channels.discord`:

```json
"aliases": {
  "captain": "1479511212273172685",
  "lt": "...",
  "chief": "..."
}
```

Then wire alias resolution into `parseAndResolveRecipient()` in `recipient-resolution.ts` or
`resolveDiscordTarget()` in `target-resolver.ts`.

## Affected Deliveries

- `daily-maintenance` alerts (4 AM daily)
- `daily-backup` alerts (4:30 AM daily)  
- `daily-security-monitor` (3 AM daily)
- `lt-market-scan` crons
- `agentmail-noon-check`, `agentmail-4pm-check`
- All other crons with `delivery.channel: "discord"`

## Files

- Delivery queue: `~/.openclaw/delivery-queue/*.json`
- Plugin target parsing: `~/.openclaw/npm/node_modules/@openclaw/discord/src/target-parsing.ts`
- Plugin target resolver: `~/.openclaw/npm/node_modules/@openclaw/discord/src/target-resolver.ts`
- Plugin recipient resolution: `~/.openclaw/npm/node_modules/@openclaw/discord/src/recipient-resolution.ts`

## Related Fixes

- **2026-05-03:** Fixed delivery queue by replacing `"channel:captain"` → numeric ID (manual workaround)

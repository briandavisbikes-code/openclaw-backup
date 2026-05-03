# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Weather Preferences

- Temperature unit: Fahrenheit (use ?u parameter with wttr.in)

---

## Obsidian Vault (Memory System)
- **Vault path:** `~/Documents/Obsidian/Brain`
- **Structure:**
  - `Agent-Shared/` — user-profile.md, project-state.md, decisions-log.md
  - `Agent-Hermes/daily/` — daily session logs (2026-04-09.md etc.)
  - `Agent-Hermes/` — working-context.md, mistakes.md
  - `Agent-OpenClaw/` — OpenClaw workspace
- **OpenClaw reads:** Agent-Shared/* on session start
- **OpenClaw writes:** daily logs, working-context, mistakes, decisions-log

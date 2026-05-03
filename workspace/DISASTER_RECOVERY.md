# OpenClaw Disaster Recovery Plan

## Quick Restore (Run on New Mac)

```bash
# 1. Install Homebrew (if not present)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install required software
brew install node pnpm opencli clawhub

# 3. Clone this backup repo
git clone https://github.com/briandavisbikes-code/openclaw-backup.git ~/openclaw-backup

# 4. Copy config files
cp ~/openclaw-backup/openclaw.json ~/.openclaw/
cp ~/openclaw-backup/openclaw.env ~/.openclaw/  # May need to update secrets

# 5. Install skills
cd ~/.openclaw/workspace/skills && clawhub install --all

# 6. Install cron scripts
cp -r ~/openclaw-backup/scripts ~/

# 7. Install Ollama (optional)
brew install ollama

# 8. Start gateway
openclaw gateway start
```

## What Gets Backed Up (auto via cron)

| Item | Location | Status |
|------|----------|--------|
| Config | ~/.openclaw/openclaw.json | ✅ Backed up |
| Secrets | ~/.openclaw/openclaw.env | ⚠️ NOT pushed (local only) |
| Skills | ~/.openclaw/workspace/skills/ | ✅ Backed up |
| Memory | ~/.openclaw/workspace/memory/ | ✅ Backed up |
| Scripts | ~/agentmail-*/, ~/openclaw-*.sh | ✅ Backed up |
| Cron Jobs | Managed by OpenClaw | ⚠️ Recreate manually |

## Manual Steps After Restore

1. **Discord Bot** - Token in openclaw.json (already backed up)
2. **LaunchAgent** - Run: `openclaw service install`
3. **Cron Jobs** - Recreate:
   - Daily affirmation (Davina)
   - Morning brief (8 AM)
   - Jessica weekly email
   - AgentMail inbox checks
   - Security monitoring
4. **API Keys** - Update openclaw.env if needed:
   - MiniMax
   - Discord token
   - AgentMail
   - X API
   - Binance (Gunner)
5. **Tailscale** - Run: `brew services start tailscale && tailscale up`

## Critical Secrets (Keep Safe)

Store these somewhere safe (password manager, encrypted USB):
- ~/.openclaw/openclaw.env contents
- Discord bot token
- API keys (MiniMax, X, Binance, AgentMail)

## Backup Schedule

- **Daily** at 4:30 AM (via cron)
- Pushes to: github.com/briandavisbikes-code/openclaw-backup

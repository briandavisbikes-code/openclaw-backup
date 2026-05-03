# Discord Gemini Skill

Routes Discord messages through Gemini bridge instead of DeepSeek.

## How it works

1. Intercepts Discord messages
2. Sends to Gemini bridge (http://localhost:3000/generate)
3. Returns Gemini responses to Discord

## Setup

Ensure bridge is running:
```bash
cd ~/.openclaw/workspace
node gemini-bridge.js
```

## Cost Savings

- DeepSeek: ~$0.28/1M input tokens
- Gemini: ~$0.075/1M input tokens
- **Savings: 73%**

## Fallback

If bridge fails, falls back to DeepSeek.

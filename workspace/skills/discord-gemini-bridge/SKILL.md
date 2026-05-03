# Discord Gemini Bridge Skill

Routes Discord messages through Gemini bridge for 73% cost savings with DeepSeek fallback.

## Purpose

Intercept Discord messages and:
1. Send to Gemini bridge (http://localhost:3001/process)
2. Return Gemini responses (73% cheaper than DeepSeek)
3. Fall back to DeepSeek if bridge fails
4. Log usage for cost tracking

## How It Works

1. **Interception**: Catches Discord messages before they reach DeepSeek
2. **Routing**: Sends to Gemini bridge via HTTP POST
3. **Response**: Returns Gemini response to Discord
4. **Fallback**: If bridge fails, uses original DeepSeek flow
5. **Logging**: Tracks usage for cost analysis

## Setup

### Prerequisites
1. Gemini bridge running: `http://localhost:3000`
2. Discord integration running: `http://localhost:3001`
3. Both services auto-start via LaunchAgent

### Installation
1. Copy this skill to OpenClaw skills directory
2. Restart OpenClaw gateway
3. Skill auto-activates for Discord messages

## Configuration

Default endpoints:
- **Bridge**: `http://localhost:3000/generate`
- **Integration**: `http://localhost:3001/process`
- **Fallback**: `deepseek/deepseek-chat`

## Cost Savings

| Model | Input Cost | Output Cost | Savings |
|-------|------------|-------------|---------|
| DeepSeek | ~$0.28/1M | ~$1.10/1M | Baseline |
| Gemini | ~$0.075/1M | ~$0.30/1M | **73%** |

## Testing

### Health check:
```bash
curl http://localhost:3001/status
```

### Test message:
```bash
curl -X POST http://localhost:3001/process \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test message"}'
```

### Verify skill is active:
Send a Discord message - response should come from Gemini.

## Troubleshooting

### Bridge not responding:
1. Check if bridge is running:
   ```bash
   curl http://localhost:3000/health
   ```
2. Restart bridge:
   ```bash
   cd ~/.openclaw/workspace
   pkill -f "node gemini-bridge.js"
   node gemini-bridge.js
   ```

### Skill not intercepting:
1. Check if skill is loaded:
   ```bash
   openclaw skills list | grep discord-gemini
   ```
2. Restart OpenClaw gateway

### Fallback not working:
Check integration logs:
```bash
tail -f ~/.openclaw/workspace/discord-gemini.log
```

## Monitoring

### Logs:
- Bridge: `~/.openclaw/workspace/gemini-bridge.log`
- Integration: `~/.openclaw/workspace/discord-gemini.log`

### Usage tracking:
Skill logs each request with:
- Timestamp
- Prompt length (tokens estimate)
- Response source (gemini-bridge or deepseek-fallback)
- Response length

## Notes

- This is a temporary workaround for OpenClaw Google plugin bug
- When OpenClaw fixes their plugin, this skill can be removed
- All responses are logged for cost analysis
- Fallback ensures Discord never goes silent
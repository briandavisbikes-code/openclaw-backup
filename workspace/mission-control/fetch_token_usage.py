#!/usr/bin/env python3
"""
Fetch token usage from OpenClaw gateway logs and update token-costs.json
"""
import json
import re
import datetime
import os

def get_token_usage():
    """Parse gateway.log for token usage data"""
    log_path = os.path.expanduser("~/.openclaw/gateway.log")
    
    total_tokens = 0
    sessions = []
    
    try:
        with open(log_path, 'r') as f:
            content = f.read()
        
        # Find all session summaries with totalTokens
        pattern = r'"totalTokens"\s*:\s*(\d+).*?"model"\s*:\s*"([^"]+)"'
        matches = re.findall(pattern, content)
        
        if matches:
            for tokens, model in matches[-10:]:  # Last 10 sessions
                sessions.append({
                    "model": model,
                    "tokens": int(tokens)
                })
            total_tokens = sum(s[-1]["tokens"] for s in [sessions[-1:]])
        
        # Simple estimation based on typical usage
        # MiniMax pricing: $0.99/1M input, $1.99/1M output
        # Assume 70% input, 30% output
        input_tokens = int(total_tokens * 0.7)
        output_tokens = int(total_tokens * 0.3)
        estimated_cost = (input_tokens / 1_000_000 * 0.99) + (output_tokens / 1_000_000 * 1.99)
        
        return {
            "lastUpdated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "currentSession": {
                "totalTokens": total_tokens,
                "inputTokens": input_tokens,
                "outputTokens": output_tokens,
                "estimatedCost": round(estimated_cost, 4)
            },
            "today": {
                "inputTokens": input_tokens * 5,  # Rough estimate
                "outputTokens": output_tokens * 5,
                "estimatedCost": round(estimated_cost * 5, 2)
            },
            "week": {
                "inputTokens": input_tokens * 35,
                "outputTokens": output_tokens * 35,
                "estimatedCost": round(estimated_cost * 35, 2)
            },
            "month": {
                "inputTokens": input_tokens * 150,
                "outputTokens": output_tokens * 150,
                "estimatedCost": round(estimated_cost * 150, 2)
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "lastUpdated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        }

if __name__ == "__main__":
    usage = get_token_usage()
    output_path = os.path.join(os.path.dirname(__file__), "token-costs.json")
    with open(output_path, "w") as f:
        json.dump(usage, f, indent=2)
    print(f"Updated token-costs.json at {usage['lastUpdated']}")

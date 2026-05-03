#!/usr/bin/env python3
"""
Fetch MiniMax API usage data
Requires MINIMAX_API_KEY in environment or config
"""

import json
import urllib.request
import urllib.parse
import datetime
import os

def fetch_minimax_usage():
    """Try to fetch usage from MiniMax API"""
    
    # Try to get API key from environment or config
    api_key = os.environ.get('MINIMAX_API_KEY') or os.environ.get('OPENAI_API_KEY') or ''
    
    # Alternative: read from openclaw config
    config_path = os.path.expanduser('~/.openclaw/openclaw.json')
    if os.path.exists(config_path):
        try:
            with open(config_path) as f:
                config = json.load(f)
                api_key = config.get('channels', {}).get('minimax', {}).get('apiKey', '') or api_key
        except:
            pass
    
    if not api_key:
        return {"error": "No API key found"}
    
    # Try MiniMax API endpoints
    endpoints = [
        "https://api.minimaxi.chat/v1/subscription",
        "https://api.minimaxi.chat/v1/usage",
        "https://api.minimaxi.chat/v1/balance"
    ]
    
    for url in endpoints:
        try:
            req = urllib.request.Request(
                url,
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())
                return data
        except Exception as e:
            continue
    
    return {"error": "Could not reach MiniMax API"}

if __name__ == "__main__":
    result = fetch_minimax_usage()
    print(json.dumps(result, indent=2))

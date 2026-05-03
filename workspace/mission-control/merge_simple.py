#!/usr/bin/env python3
import re

# Read current index.html
with open('index.html', 'r') as f:
    html = f.read()

# Extract existing tool cards
pattern = r'<a href="([^"]+)" target="_blank" class="tool-card">\s*<span class="tool-icon">([^<]+)</span>\s*<span class="tool-title">([^<]+)</span>\s*<span class="tool-desc">([^<]+)</span>\s*</a>'
existing = re.findall(pattern, html, re.DOTALL)
print(f"Found {len(existing)} existing tool cards")

# Old links data (url, icon, title)
links = [
    ("https://github.com", "🐙", "GitHub"),
    ("https://chat.openai.com", "🤖", "ChatGPT"),
    ("https://claude.ai", "🧠", "Claude"),
    ("https://discord.com", "💬", "Discord"),
    ("https://youtube.com", "▶️", "YouTube"),
    ("https://twitter.com", "🐦", "X/Twitter"),
    ("https://www.minimax.io", "🧠", "MiniMax"),
    ("https://clawhub.com", "🛠️", "ClawHub"),
    ("https://cursor.sh", "⌨️", "Cursor"),
    ("https://perplexity.ai", "🔍", "Perplexity"),
    ("https://cloudflare.com", "☁️", "Cloudflare"),
    ("https://vercel.com", "▲", "Vercel"),
    ("https://supabase.com", "🗄️", "Supabase"),
    ("https://deepseek.com", "🧠", "DeepSeek"),
    ("https://whisperflow.ai", "🎙️", "Whisperflow"),
    ("https://www.anycubic.com/pages/anycubic-slicer", "🖨️", "Anycubic Slicer"),
    ("https://www.thingiverse.com", "🧱", "Thingiverse"),
    ("https://www.printables.com", "📐", "Printables"),
    ("https://www.figma.com", "🎨", "Figma"),
    ("https://stackoverflow.com", "📚", "Stack Overflow"),
    ("https://developer.mozilla.org", "📖", "MDN Docs"),
    ("https://replit.com", "⚡", "Replit"),
    ("https://codesandbox.io", "📦", "CodeSandbox"),
    ("https://crontab.guru", "⏰", "Crontab Guru"),
    ("https://regex101.com", "🔤", "Regex101"),
    ("https://jsonplaceholder.typicode.com", "📋", "JSON Placeholder"),
    ("https://ngrok.com", "🌐", "ngrok"),
    ("https://www.digitalocean.com", "🐳", "DigitalOcean"),
    ("https://www.coinbase.com", "💰", "Coinbase"),
    ("https://www.binance.com", "🟡", "Binance"),
    ("https://www.coingecko.com", "🦎", "CoinGecko"),
    ("https://www.canva.com", "🖌️", "Canva"),
    ("https://tailwindcss.com", "💨", "Tailwind"),
    ("https://getbootstrap.com", "🅱️", "Bootstrap"),
    ("https://gitlab.com", "🦊", "GitLab"),
    ("https://bitbucket.org", "🪣", "Bitbucket"),
    ("https://www.okx.com", "🔵", "OKX"),
    ("https://www.kraken.com", "🦑", "Kraken"),
    ("https://www.bybit.com", "🟣", "Bybit"),
    ("https://www.thingiverse.com/thing:new", "➕", "Thingiverse Upload"),
    ("https://www.printables.com/model/new", "➕", "Printables Upload"),
    ("https://webhook.site", "🪝", "Webhook.site"),
    ("https://www.linkedin.com", "💼", "LinkedIn"),
    ("https://apps.nationalmap.gov/viewer/", "🗺️", "USGS National Map"),
    ("https://terrain2stl.com", "🏔️", "Terrain2STL"),
    ("https://wiki.anycubic.com/en/fdm-3d-printer/anycubic-kobra-x?_sasdk=fYnJpYW5kYXZpc2Jpa2VzQG1zbi5jb20", "🖨️", "Kobra X Wiki"),
    ("https://touchterrain.geog.mcgill.ca", "🌍", "TouchTerrain"),
    ("https://cable.creux.fr/discord/1", "🔌", "Cable Discord"),
    ("https://www.hitem3d.ai/?utm_source=google&utm_medium=sign_up&utm_campaign=23156713366&gad_source=1&gad_campaignid=23152268336&gbraid=0AAAABAd7BRMsjp6DVEMgZMbfG_vHrJgai&gclid=CjwKCAjw687NBhB4EiwAQ645drOQXEDCO8G-I3RTB3BtFUu1q2MwzPMZ71Tc1C1Q5VEcSiVEQbjwnxoCYNIQAvD_BwE", "🎯", "HitErmUp"),
    ("/cron.html", "📊", "Cron Dashboard"),
]

print(f"Adding {len(links)} link cards")

# Merge deduplicating by URL
url_set = set()
merged = []

# Add existing
for url, icon, title, desc in existing:
    if url not in url_set:
        url_set.add(url)
        merged.append((url, icon, title, desc))

# Add links
for url, icon, title in links:
    if url not in url_set:
        url_set.add(url)
        # Generate description
        desc = "Useful tool or resource"
        if 'github.com' in url and 'copilot' not in title.lower():
            desc = 'Code hosting & collaboration'
        elif 'discord.com' in url:
            desc = 'Chat & community platform'
        elif 'youtube.com' in url:
            desc = 'Video sharing platform'
        elif 'twitter.com' in url:
            desc = 'Social media platform'
        elif 'minimax.io' in url:
            desc = 'AI models & API'
        elif 'clawhub.com' in url:
            desc = 'OpenClaw skills repository'
        elif 'cursor.sh' in url:
            desc = 'AI-powered code editor'
        elif 'cloudflare.com' in url:
            desc = 'CDN & security services'
        elif 'vercel.com' in url:
            desc = 'Frontend deployment platform'
        elif 'supabase.com' in url:
            desc = 'Backend-as-a-Service'
        elif 'deepseek.com' in url:
            desc = 'AI research company'
        elif 'whisperflow.ai' in url:
            desc = 'Audio transcription tools'
        elif 'anycubic.com' in url:
            desc = '3D printer software'
        elif 'thingiverse.com' in url:
            desc = '3D model repository'
        elif 'printables.com' in url:
            desc = '3D printing community'
        elif 'figma.com' in url:
            desc = 'Design collaboration tool'
        elif 'stackoverflow.com' in url:
            desc = 'Programming Q&A'
        elif 'developer.mozilla.org' in url:
            desc = 'Web documentation'
        elif 'replit.com' in url:
            desc = 'Online coding environment'
        elif 'codesandbox.io' in url:
            desc = 'Web development sandbox'
        elif 'crontab.guru' in url:
            desc = 'Cron schedule helper'
        elif 'regex101.com' in url:
            desc = 'Regular expression tester'
        elif 'jsonplaceholder.typicode.com' in url:
            desc = 'Fake REST API for testing'
        elif 'ngrok.com' in url:
            desc = 'Secure tunnels to localhost'
        elif 'digitalocean.com' in url:
            desc = 'Cloud infrastructure'
        elif 'coinbase.com' in url:
            desc = 'Cryptocurrency exchange'
        elif 'binance.com' in url:
            desc = 'Crypto trading platform'
        elif 'coingecko.com' in url:
            desc = 'Cryptocurrency data'
        elif 'canva.com' in url:
            desc = 'Graphic design platform'
        elif 'tailwindcss.com' in url:
            desc = 'CSS framework'
        elif 'getbootstrap.com' in url:
            desc = 'Frontend component library'
        elif 'gitlab.com' in url:
            desc = 'DevOps platform'
        elif 'bitbucket.org' in url:
            desc = 'Git repository hosting'
        elif 'okx.com' in url:
            desc = 'Crypto exchange'
        elif 'kraken.com' in url:
            desc = 'Crypto trading platform'
        elif 'bybit.com' in url:
            desc = 'Crypto derivatives exchange'
        elif 'webhook.site' in url:
            desc = 'Webhook testing tool'
        elif 'linkedin.com' in url:
            desc = 'Professional networking'
        elif 'nationalmap.gov' in url:
            desc = 'USGS topographic maps'
        elif 'terrain2stl.com' in url:
            desc = 'Terrain to STL converter'
        elif 'anycubic.com' in url and 'wiki' in url:
            desc = '3D printer documentation'
        elif 'touchterrain.geog.mcgill.ca' in url:
            desc = '3D terrain generator'
        elif 'cable.creux.fr' in url:
            desc = 'Discord bot dashboard'
        elif 'hitem3d.ai' in url:
            desc = '3D model marketplace'
        elif url == '/cron.html':
            desc = 'Local cron job dashboard'
        merged.append((url, icon, title, desc))

print(f"Total merged cards: {len(merged)}")

# Generate HTML
indent = '                '
new_html = '<div class="tools-grid">\n'
for url, icon, title, desc in merged:
    # Escape HTML
    desc = desc.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
    new_html += f'{indent}<a href="{url}" target="_blank" class="tool-card">\n'
    new_html += f'{indent}    <span class="tool-icon">{icon}</span>\n'
    new_html += f'{indent}    <span class="tool-title">{title}</span>\n'
    new_html += f'{indent}    <span class="tool-desc">{desc}</span>\n'
    new_html += f'{indent}</a>\n'
new_html += '            </div>'

print("\nGenerated new tools-grid HTML (first 2000 chars):")
print(new_html[:2000])

# Write to file
with open('new_tools_grid.html', 'w') as f:
    f.write(new_html)

print("\nWrote new_tools_grid.html")

# Output for edit tool
print("\n=== REPLACEMENT TEXT ===")
print(new_html)
print("=== END ===")
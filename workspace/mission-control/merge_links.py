import re
import html

def extract_tool_cards(html_text):
    """Extract tool-card elements from tools-grid"""
    pattern = r'<a href="([^"]+)" target="_blank" class="tool-card">\s*<span class="tool-icon">([^<]+)</span>\s*<span class="tool-title">([^<]+)</span>\s*<span class="tool-desc">([^<]+)</span>\s*</a>'
    matches = re.findall(pattern, html_text, re.DOTALL)
    cards = []
    for url, icon, title, desc in matches:
        cards.append({
            'url': url.strip(),
            'icon': icon.strip(),
            'title': title.strip(),
            'desc': desc.strip()
        })
    return cards

def extract_link_cards(html_text):
    """Extract link-card elements from links-grid"""
    pattern = r'<a href="([^"]+)" target="_blank" class="link-card">\s*<span class="link-icon">([^<]+)</span>\s*<span class="link-title">([^<]+)</span>\s*</a>'
    matches = re.findall(pattern, html_text, re.DOTALL)
    cards = []
    for url, icon, title in matches:
        cards.append({
            'url': url.strip(),
            'icon': icon.strip(),
            'title': title.strip(),
            'desc': ''  # No description in link cards
        })
    return cards

# Existing tool cards HTML (from AI Tools Directory)
existing_tools_html = '''
<div class="tools-grid">
                <a href="https://gemini.google.com" target="_blank" class="tool-card">
                    <span class="tool-icon">🤖</span>
                    <span class="tool-title">Gemini</span>
                    <span class="tool-desc">Google's AI, free, great for research</span>
                </a>
                <a href="http://localhost:11434" target="_blank" class="tool-card">
                    <span class="tool-icon">🏠</span>
                    <span class="tool-title">Ollama</span>
                    <span class="tool-desc">Local models (phi3:latest), free</span>
                </a>
                <a href="https://chat.deepseek.com" target="_blank" class="tool-card">
                    <span class="tool-icon">🔍</span>
                    <span class="tool-title">DeepSeek</span>
                    <span class="tool-desc">Reasoner V3, $0.27/1M in</span>
                </a>
                <a href="https://claude.ai" target="_blank" class="tool-card">
                    <span class="tool-icon">🧠</span>
                    <span class="tool-title">Claude</span>
                    <span class="tool-desc">Anthropic, context-aware</span>
                </a>
                <a href="https://chat.openai.com" target="_blank" class="tool-card">
                    <span class="tool-icon">⚡</span>
                    <span class="tool-title">ChatGPT</span>
                    <span class="tool-desc">GPT-4, plugins, browsing</span>
                </a>
                <a href="https://openclaw.ai" target="_blank" class="tool-card">
                    <span class="tool-icon">🦞</span>
                    <span class="tool-title">OpenClaw</span>
                    <span class="tool-desc">Your agent platform</span>
                </a>
                <a href="https://www.perplexity.ai" target="_blank" class="tool-card">
                    <span class="tool-icon">❓</span>
                    <span class="tool-title">Perplexity</span>
                    <span class="tool-desc">Web search + citations</span>
                </a>
                <a href="https://github.com" target="_blank" class="tool-card">
                    <span class="tool-icon">💻</span>
                    <span class="tool-title">GitHub Copilot</span>
                    <span class="tool-desc">Code completion, $10/mo</span>
                </a>
            </div>
'''

# Links from LINKS tab (copied from HTML)
links_html = '''
<div class="links-grid">
            <a href="https://github.com" target="_blank" class="link-card">
                <span class="link-icon">🐙</span>
                <span class="link-title">GitHub</span>
            </a>
            <a href="https://chat.openai.com" target="_blank" class="link-card">
                <span class="link-icon">🤖</span>
                <span class="link-title">ChatGPT</span>
            </a>
            <a href="https://claude.ai" target="_blank" class="link-card">
                <span class="link-icon">🧠</span>
                <span class="link-title">Claude</span>
            </a>
            <a href="https://discord.com" target="_blank" class="link-card">
                <span class="link-icon">💬</span>
                <span class="link-title">Discord</span>
            </a>
            <a href="https://youtube.com" target="_blank" class="link-card">
                <span class="link-icon">▶️</span>
                <span class="link-title">YouTube</span>
            </a>
            <a href="https://twitter.com" target="_blank" class="link-card">
                <span class="link-icon">🐦</span>
                <span class="link-title">X/Twitter</span>
            </a>
            <a href="https://www.minimax.io" target="_blank" class="link-card">
                <span class="link-icon">🧠</span>
                <span class="link-title">MiniMax</span>
            </a>
            <a href="https://clawhub.com" target="_blank" class="link-card">
                <span class="link-icon">🛠️</span>
                <span class="link-title">ClawHub</span>
            </a>
            <a href="https://cursor.sh" target="_blank" class="link-card">
                <span class="link-icon">⌨️</span>
                <span class="link-title">Cursor</span>
            </a>
            <a href="https://perplexity.ai" target="_blank" class="link-card">
                <span class="link-icon">🔍</span>
                <span class="link-title">Perplexity</span>
            </a>
            <a href="https://cloudflare.com" target="_blank" class="link-card">
                <span class="link-icon">☁️</span>
                <span class="link-title">Cloudflare</span>
            </a>
            <a href="https://vercel.com" target="_blank" class="link-card">
                <span class="link-icon">▲</span>
                <span class="link-title">Vercel</span>
            </a>
            <a href="https://supabase.com" target="_blank" class="link-card">
                <span class="link-icon">🗄️</span>
                <span class="link-title">Supabase</span>
            </a>
            <a href="https://deepseek.com" target="_blank" class="link-card">
                <span class="link-icon">🧠</span>
                <span class="link-title">DeepSeek</span>
            </a>
            <a href="https://whisperflow.ai" target="_blank" class="link-card">
                <span class="link-icon">🎙️</span>
                <span class="link-title">Whisperflow</span>
            </a>
            <a href="https://www.anycubic.com/pages/anycubic-slicer" target="_blank" class="link-card">
                <span class="link-icon">🖨️</span>
                <span class="link-title">Anycubic Slicer</span>
            </a>
            <a href="https://www.thingiverse.com" target="_blank" class="link-card">
                <span class="link-icon">🧱</span>
                <span class="link-title">Thingiverse</span>
            </a>
            <a href="https://www.printables.com" target="_blank" class="link-card">
                <span class="link-icon">📐</span>
                <span class="link-title">Printables</span>
            </a>
            <a href="https://www.figma.com" target="_blank" class="link-card">
                <span class="link-icon">🎨</span>
                <span class="link-title">Figma</span>
            </a>
            <a href="https://stackoverflow.com" target="_blank" class="link-card">
                <span class="link-icon">📚</span>
                <span class="link-title">Stack Overflow</span>
            </a>
            <a href="https://developer.mozilla.org" target="_blank" class="link-card">
                <span class="link-icon">📖</span>
                <span class="link-title">MDN Docs</span>
            </a>
            <a href="https://replit.com" target="_blank" class="link-card">
                <span class="link-icon">⚡</span>
                <span class="link-title">Replit</span>
            </a>
            <a href="https://codesandbox.io" target="_blank" class="link-card">
                <span class="link-icon">📦</span>
                <span class="link-title">CodeSandbox</span>
            </a>
            <a href="https://crontab.guru" target="_blank" class="link-card">
                <span class="link-icon">⏰</span>
                <span class="link-title">Crontab Guru</span>
            </a>
            <a href="https://regex101.com" target="_blank" class="link-card">
                <span class="link-icon">🔤</span>
                <span class="link-title">Regex101</span>
            </a>
            <a href="https://jsonplaceholder.typicode.com" target="_blank" class="link-card">
                <span class="link-icon">📋</span>
                <span class="link-title">JSON Placeholder</span>
            </a>
            <a href="https://ngrok.com" target="_blank" class="link-card">
                <span class="link-icon">🌐</span>
                <span class="link-title">ngrok</span>
            </a>
            <a href="https://www.digitalocean.com" target="_blank" class="link-card">
                <span class="link-icon">🐳</span>
                <span class="link-title">DigitalOcean</span>
            </a>
            <a href="https://www.coinbase.com" target="_blank" class="link-card">
                <span class="link-icon">💰</span>
                <span class="link-title">Coinbase</span>
            </a>
            <a href="https://www.binance.com" target="_blank" class="link-card">
                <span class="link-icon">🟡</span>
                <span class="link-title">Binance</span>
            </a>
            <a href="https://www.coingecko.com" target="_blank" class="link-card">
                <span class="link-icon">🦎</span>
                <span class="link-title">CoinGecko</span>
            </a>
            <a href="https://www.canva.com" target="_blank" class="link-card">
                <span class="link-icon">🖌️</span>
                <span class="link-title">Canva</span>
            </a>
            <a href="https://tailwindcss.com" target="_blank" class="link-card">
                <span class="link-icon">💨</span>
                <span class="link-title">Tailwind</span>
            </a>
            <a href="https://getbootstrap.com" target="_blank" class="link-card">
                <span class="link-icon">🅱️</span>
                <span class="link-title">Bootstrap</span>
            </a>
            <a href="https://gitlab.com" target="_blank" class="link-card">
                <span class="link-icon">🦊</span>
                <span class="link-title">GitLab</span>
            </a>
            <a href="https://bitbucket.org" target="_blank" class="link-card">
                <span class="link-icon">🪣</span>
                <span class="link-title">Bitbucket</span>
            </a>
            <a href="https://www.okx.com" target="_blank" class="link-card">
                <span class="link-icon">🔵</span>
                <span class="link-title">OKX</span>
            </a>
            <a href="https://www.kraken.com" target="_blank" class="link-card">
                <span class="link-icon">🦑</span>
                <span class="link-title">Kraken</span>
            </a>
            <a href="https://www.bybit.com" target="_blank" class="link-card">
                <span class="link-icon">🟣</span>
                <span class="link-title">Bybit</span>
            </a>
            <a href="https://www.thingiverse.com/thing:new" target="_blank" class="link-card">
                <span class="link-icon">➕</span>
                <span class="link-title">Thingiverse Upload</span>
            </a>
            <a href="https://www.printables.com/model/new" target="_blank" class="link-card">
                <span class="link-icon">➕</span>
                <span class="link-title">Printables Upload</span>
            </a>
            <a href="https://webhook.site" target="_blank" class="link-card">
                <span class="link-icon">🪝</span>
                <span class="link-title">Webhook.site</span>
            </a>
            <a href="https://www.linkedin.com" target="_blank" class="link-card">
                <span class="link-icon">💼</span>
                <span class="link-title">LinkedIn</span>
            </a>
            <a href="https://apps.nationalmap.gov/viewer/" target="_blank" class="link-card">
                <span class="link-icon">🗺️</span>
                <span class="link-title">USGS National Map</span>
            </a>
            <a href="https://terrain2stl.com" target="_blank" class="link-card">
                <span class="link-icon">🏔️</span>
                <span class="link-title">Terrain2STL</span>
            </a>
            <a href="https://wiki.anycubic.com/en/fdm-3d-printer/anycubic-kobra-x?_sasdk=fYnJpYW5kYXZpc2Jpa2VzQG1zbi5jb20" target="_blank" class="link-card">
                <span class="link-icon">🖨️</span>
                <span class="link-title">Kobra X Wiki</span>
            </a>
            <a href="https://touchterrain.geog.mcgill.ca" target="_blank" class="link-card">
                <span class="link-icon">🌍</span>
                <span class="link-title">TouchTerrain</span>
            </a>
            <a href="https://cable.creux.fr/discord/1" target="_blank" class="link-card">
                <span class="link-icon">🔌</span>
                <span class="link-title">Cable Discord</span>
            </a>
            <a href="https://www.hitem3d.ai/?utm_source=google&utm_medium=sign_up&utm_campaign=23156713366&gad_source=1&gad_campaignid=23152268336&gbraid=0AAAABAd7BRMsjp6DVEMgZMbfG_vHrJgai&gclid=CjwKCAjw687NBhB4EiwAQ645drOQXEDCO8G-I3RTB3BtFUu1q2MwzPMZ71Tc1C1Q5VEcSiVEQbjwnxoCYNIQAvD_BwE" target="_blank" class="link-card">
                <span class="link-icon">🎯</span>
                <span class="link-title">HitErmUp</span>
            </a>
            <a href="/cron.html" target="_blank" class="link-card">
                <span class="link-icon">📊</span>
                <span class="link-title">Cron Dashboard</span>
            </a>
        </div>
'''

# Extract cards
existing_cards = extract_tool_cards(existing_tools_html)
link_cards = extract_link_cards(links_html)

print(f"Existing tool cards: {len(existing_cards)}")
print(f"Link cards: {len(link_cards)}")

# Merge, deduplicate by URL
url_set = set()
merged_cards = []

# First add existing cards (they have descriptions)
for card in existing_cards:
    url = card['url']
    if url not in url_set:
        url_set.add(url)
        merged_cards.append(card)

# Then add link cards, skipping duplicates
for card in link_cards:
    url = card['url']
    if url not in url_set:
        url_set.add(url)
        # Add generic description based on title/domain
        desc = ''
        if 'github.com' in url and 'copilot' not in card['title'].lower():
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
        else:
            desc = 'Useful tool or resource'
        
        card['desc'] = desc
        merged_cards.append(card)

print(f"Merged unique cards: {len(merged_cards)}")

# Generate new tools-grid HTML
indent = '                '
new_html = '<div class="tools-grid">\n'
for card in merged_cards:
    # Escape HTML entities in descriptions
    desc = html.escape(card['desc'])
    new_html += f'{indent}<a href="{card["url"]}" target="_blank" class="tool-card">\n'
    new_html += f'{indent}    <span class="tool-icon">{card["icon"]}</span>\n'
    new_html += f'{indent}    <span class="tool-title">{card["title"]}</span>\n'
    new_html += f'{indent}    <span class="tool-desc">{desc}</span>\n'
    new_html += f'{indent}</a>\n'
new_html += '            </div>'

print("Generated new tools-grid HTML:")
print(new_html[:500])

# Write to file for inspection
with open('new_tools_grid.html', 'w') as f:
    f.write(new_html)

print("\nWrote new_tools_grid.html")

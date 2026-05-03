#!/usr/bin/env python3
import re

with open('index.html', 'r') as f:
    content = f.read()

# Find the tools-grid div and insert a new card before its closing </div>
pattern = r'(<div class="tools-grid">.*?)(</div>\s*</div>\s*</div>)'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("Could not find tools-grid")
    exit(1)

before = match.group(1)
after = match.group(2)

# New card HTML (with proper indentation)
new_card = '''                <a href="https://console.agentmail.to/dashboard/inboxes/productionx@agentmail.to" target="_blank" class="tool-card">
                    <span class="tool-icon">📧</span>
                    <span class="tool-title">Agent Mail</span>
                    <span class="tool-desc">AI email inbox dashboard</span>
                </a>
'''

# Insert new card before the closing </div> of tools-grid
# The before string ends with the last tool-card's closing </a> and whitespace.
# We'll append new_card before the final whitespace before </div>.
# Let's just replace the entire match with before + new_card + after
new_content = before + new_card + after

# Write back
with open('index.html', 'w') as f:
    f.write(new_content)

print("Added Agent Mail card to tools-grid")
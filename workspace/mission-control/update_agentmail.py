#!/usr/bin/env python3
import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Replace tools-grid with merged links + Agent Mail
with open('final_tools_grid_with_agentmail.html', 'r') as f:
    new_tools_grid = f.read().strip()  # ends with </div>

# Find the pattern: <div class="tools-grid"> ... </div> followed by two more </div>
# We'll capture the whole block from <div class="tools-grid"> to the third </div>
pattern = r'(<div class="tools-grid">.*?</div>\s*</div>\s*</div>)'
match = re.search(pattern, html, re.DOTALL)
if not match:
    print("Could not find tools-grid block")
    exit(1)

old_block = match.group(1)
# The new block should be new_tools_grid plus the two extra closing divs
# Extract the two extra closing divs from old_block
# The old_block ends with </div>\n        </div>\n    </div> (maybe with whitespace)
# Let's capture the trailing part after the first </div> that closes tools-grid.
# Simpler: we know the structure: tools-grid div, then </div> (dashboard-section), then </div> (tab-content)
# We'll keep the same whitespace as in old_block.
# Find the last three </div> tags with their whitespace.
trailing_match = re.search(r'(</div>\s*</div>\s*</div>)$', old_block, re.DOTALL)
if trailing_match:
    trailing = trailing_match.group(1)
else:
    trailing = "\n        </div>\n    </div>"

new_block = new_tools_grid + trailing
html = html.replace(old_block, new_block)
print("Replaced tools-grid with merged links + Agent Mail")

# 2. Remove Agent Mail tab button
# Find line with <button class="tab-btn" data-tab="mail">... and remove it
button_pattern = r'<button class="tab-btn" data-tab="mail">[^<]*</button>\s*'
html = re.sub(button_pattern, '', html)
print("Removed Agent Mail tab button")

# 3. Remove Agent Mail tab content (div with id="mail")
mail_pattern = r'<!-- Agent Mail Tab -->\s*<div class="tab-content" id="mail">.*?</div>\s*</div>\s*</div>'
html = re.sub(mail_pattern, '', html, flags=re.DOTALL)
print("Removed Agent Mail tab content")

# Write back
with open('index.html', 'w') as f:
    f.write(html)

print("Update complete")
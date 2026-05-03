# NBA Fantasy Assistant - Configuration

## League Info
- **League Name:** D Hill's League
- **League ID:** 18603
- **Season:** 2026
- **Platform:** ESPN

## Your Team
- **Team Name:** Team Scrubs (formerly TeamGetSum)
- **Team ID:** 5

## ESPN Username
- bgdavisX

## Data Sources
- **ESPN** - Standings, scores, news (web fetch)
- **Basketball-Reference** - Player stats, history, injury data (web fetch)
- **NBA.com** - Official stats via nba_api Python package ✅ WORKING
- **Twitter/X** - NBA news (xurl skill)

## Features

### Trade Analysis
When you ask about a trade, I can:
1. Pull stats for both players via nba_api
2. Analyze fantasy impact (points, rebounds, assists, etc.)
3. Give you a verdict on who wins the trade

**Just ask me:** "Analyze this trade: [Player A] for [Player B]"

### Player Stats
I can pull detailed stats on any NBA player using nba_api

### ~~Daily NBA Brief~~ (not needed)
### ~~Injury Reports~~ (season winding down)

## TODO
- [ ] Build trade analysis script/framework
- [ ] Get automation login working - log into ESPN within the automation browser to enable auto-fetch of league data

## Status
- ✅ Configuration saved
- ✅ Web stats fetching works
- ⏳ Auto-fetch pending - needs login within automation browser

## Last Updated
2026-03-17

# OpenClaw Content & Project Kanban

## Ideas (Backlog)
- **Twitter API integration for auto-tweets** (Hold – costs money)
- **Social media daily schedule across Twitter, LinkedIn, Instagram**
- **TruckPedia blog post: "Top 10 Most Powerful Trucks of 2025"** (leverage HP data)


- **Data story: "Evolution of Truck Horsepower Over Decades"** (visualization)
- **SEO: Target keywords "best truck for towing", "heavy duty truck specs"**
- **Mission Control: Tool to automate social media posting for TruckPedia**
- **Mission Control: Dashboard for monitoring OpenClaw cron jobs**
- **Mission Control: Explore integration with Twitter/X API** (Hold – costs money)
- **Twitter: Daily truck fact with image** (use public domain photos)
- **LinkedIn: Article about building TruckPedia database** (tech stack)
- **Instagram: Carousel of vintage trucks** (maybe partner with museums)
- **Reddit: Engage in r/truckers, r/cars with helpful data**

## To Do

- *Note: Social media execution on hold – Twitter API costs money*

## Parked

- **Automated TruckPedia content job** – prototype script (`truck‑of‑the‑day.py`) built, launchd plist parked (unscheduled)
- **Social series: "Truck of the Day"** – parked per Commander request
- **Weekly content suggestions** – cron disabled per Commander request

## Optimization (Focus) – COMPLETED
- **System monitoring script** – checks cron failures, disk usage, gateway health; posts to #monitoring
- **Memory cleanup script** – archives old .archived files, removes old logs
- **Monitoring scheduled** – every 3 hours (cron: system‑monitor)
- **Cleanup scheduled** – weekly Sunday 3 AM (cron: memory‑cleanup)
- **Cron errors resolved**:
  - ✅ truck‑database‑expansion – timeout increased, errors cleared
  - ✅ chief‑weekly‑content – model migrated to Ollama, errors cleared
  - ✅ test‑model‑column – deleted (yearly test)
  - ✅ Chief Biweekly Content Refresh – silent delivery enabled, job succeeds

## In Progress
- **DeepSeek cost monitoring** – Deckhand tracking balance

## Done
- **Ollama migration of routine tasks** ✅ Completed (chief‑weekly‑content, agentmail checks)
- **Heartbeat cost elimination** – HEARTBEAT.md updated to `HEARTBEAT_OK` only
- **Team‑self‑improvement migrated to Ollama** – launchd plist active
- **Chief weekly content migrated to Ollama** – model set to `ollama/phi3:latest`
- **AgentMail noon/4pm checks migrated to Ollama** – model updated
- **Discord slash command limit resolved** – per‑skill commands disabled, `/skill` works
- **Cron dashboard integrated** – moved to mission‑control/cron.html, linked from main dashboard
- **Mission Control consolidation** – all dashboard updates now served on port 8080
- **Daily task consolidation** – All daily updates (LT scan, truckpedia, affirmation, security) now in morning brief; 1stclass‑daily disabled
- **Affirmation script updated** – Georgette Heyer removed, Kate Morton/Anthony Horowitz/Tana French added per Davina's request


---

*Last updated: 2026‑04‑14 12:35 PM Pacific*
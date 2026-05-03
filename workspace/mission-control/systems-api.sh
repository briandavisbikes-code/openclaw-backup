#!/bin/bash
# Systems health API endpoint

echo "Content-Type: application/json"
echo ""

# Disk usage
DISK_TOTAL=$(df -h / | tail -1 | awk '{print $2}')
DISK_USED=$(df -h / | tail -1 | awk '{print $3}')
DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}')
DISK_PERCENT=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')

# Memory (convert pages to GB for readability)
MEM_TOTAL=$(sysctl -n hw.memsize 2>/dev/null | awk '{printf "%.1f GB", $1/1024/1024/1024}')
MEM_ACTIVE_PAGES=$(vm_stat | grep "Pages active" | awk '{print $3}' | tr -d '.')
MEM_ACTIVE=$(echo "scale=1; $MEM_ACTIVE_PAGES * 4096 / 1024 / 1024 / 1024" | bc 2>/dev/null || echo "0")

# CPU Load
LOAD_AVG=$(uptime | grep -o "load averages: [0-9.]*" | cut -d: -f2 | awk '{print $1}')

# Cron jobs count
CRON_COUNT=$(cat ~/.openclaw/cron/jobs.json 2>/dev/null | grep -c '"enabled": true' || echo 0)

# OpenClaw version
OC_VERSION=$(cat ~/.openclaw/update-check.json 2>/dev/null | grep -o '"version": "[^"]*"' | cut -d'"' -f4 || echo "Unknown")

# Gateway status
GATEWAY_STATUS=$(openclaw gateway status 2>/dev/null | grep -o "running\|stopped" || echo "unknown")

# External drive (if mounted)
EXT_TOTAL=$(df -h /Volumes/Untitled 2>/dev/null | tail -1 | awk '{print $2}')
EXT_USED=$(df -h /Volumes/Untitled 2>/dev/null | tail -1 | awk '{print $3}')
EXT_AVAIL=$(df -h /Volumes/Untitled 2>/dev/null | tail -1 | awk '{print $4}')
EXT_PERCENT=$(df -h /Volumes/Untitled 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%')

# If no external drive, mark as n/a
if [ -z "$EXT_TOTAL" ]; then
  EXT_TOTAL="N/A"
  EXT_USED="N/A"
  EXT_AVAIL="N/A"
  EXT_PERCENT=0
fi

# Get cron jobs as JSON array
CRON_JOBS=$(openclaw cron list 2>/dev/null | grep -v "^ID" | grep -v "^ " | grep -v "^$" | head -20 | while read line; do
  NAME=$(echo "$line" | awk '{print $2}')
  SCHEDULE=$(echo "$line" | grep -oE 'cron [^ ]+' | head -1)
  NEXT=$(echo "$line" | grep -oE 'in [0-9a-zA-Z]+' | head -1)
  STATUS=$(echo "$line" | grep -oE '(ok|error|idle)' | head -1)
  MODEL=$(echo "$line" | awk '{print $NF}')
  echo "{\"name\":\"$NAME\",\"schedule\":\"$SCHEDULE\",\"next\":\"$NEXT\",\"status\":\"$STATUS\",\"model\":\"$MODEL\"}"
done | paste -sd, - | sed 's/^/[/' | sed 's/$/]/')

# Fallback if cron list fails
if [ -z "$CRON_JOBS" ] || [ "$CRON_JOBS" = "[]" ]; then
  CRON_JOBS="[]"
fi

cat << EOF
{
  "disk": {
    "total": "$DISK_TOTAL",
    "used": "$DISK_USED",
    "available": "$DISK_AVAIL",
    "percent": $DISK_PERCENT
  },
  "external": {
    "name": "External Drive",
    "total": "$EXT_TOTAL",
    "used": "$EXT_USED",
    "available": "$EXT_AVAIL",
    "percent": $EXT_PERCENT
  },
  "memory": {
    "total": "$MEM_TOTAL",
    "active": $MEM_ACTIVE
  },
  "cpu": {
    "load": $LOAD_AVG
  },
  "cron": {
    "jobsEnabled": $CRON_COUNT,
    "jobs": $CRON_JOBS
  },
  "openclaw": {
    "version": "$OC_VERSION",
    "gateway": "$GATEWAY_STATUS"
  }
}
EOF

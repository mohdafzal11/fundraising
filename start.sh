#!/bin/bash
set -e

echo "🚀 Starting DroomFundraising services..."

# Create log directory if it doesn't exist
mkdir -p /var/log

# Start VC updater in a detached screen session
echo "📊 Starting VC updater in background..."
screen -dmS vc-updater bash -c "
  echo '🔄 VC Updater started at \$(date)' && \
  cd /app && \
  npx tsx scripts/vc-updater.ts 2>&1 | tee -a /var/log/vc-updater.log
"

# Give the updater a moment to initialize
sleep 2

# Check if vc-updater screen session is running
if screen -list | grep -q "vc-updater"; then
  echo "✅ VC updater running in screen session 'vc-updater'"
  echo "   View logs: screen -r vc-updater (then Ctrl+A, D to detach)"
else
  echo "⚠️  VC updater screen session may have failed to start"
fi

# Start Next.js server in foreground
echo "🌐 Starting Next.js server..."
exec pnpm start


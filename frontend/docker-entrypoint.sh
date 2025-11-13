#!/bin/sh
set -e

# Get API URL from environment (with fallback)
API_URL="${VITE_API_URL:-${API_URL:-http://localhost:6124/api}}"

echo "=== Movie Watchlist Docker Entrypoint ==="
echo "Injecting runtime config: VITE_API_URL=${API_URL}"

# Create config.js with runtime environment variables
cat > /app/build/config.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${API_URL}"
};
EOF

echo "Config file created at /app/build/config.js:"
cat /app/build/config.js

# Execute the main command (serve)
exec "$@"

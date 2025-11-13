#!/bin/sh
set -e

# Get API URL from environment (with fallback)
API_URL="${VITE_API_URL:-${API_URL:-http://localhost:6124/api}}"

echo "=== Docker Entrypoint ==="
echo "Injecting runtime config: VITE_API_URL=${API_URL}"

# Create config.js with runtime environment variables
cat > /usr/share/nginx/html/config.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${API_URL}"
};
EOF

echo "Config file created at /usr/share/nginx/html/config.js:"
cat /usr/share/nginx/html/config.js

# Execute the main command (nginx)
exec "$@"

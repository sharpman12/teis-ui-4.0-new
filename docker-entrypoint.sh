#!/bin/sh
# docker-entrypoint.sh - inject runtime config values into static build


# Ensure assets directory exists
TARGET_DIR=/usr/share/nginx/html/assets
mkdir -p "$TARGET_DIR"

# If KEYCLOAK_URL is provided, write it into runtime-config.js. Otherwise
# create a minimal runtime-config.js that leaves the property undefined so
# the application will fallback to the compiled environment values.
if [ -n "${KEYCLOAK_URL}" ]; then
	cat > "$TARGET_DIR/runtime-config.js" <<EOF
window.__env = window.__env || {};
window.__env.KEYCLOAK_URL = "${KEYCLOAK_URL}";
EOF
else
	cat > "$TARGET_DIR/runtime-config.js" <<'EOF'
window.__env = window.__env || {};
EOF
fi

exec "$@"

#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$SCRIPT_DIR/backend/mvnw" -f "$SCRIPT_DIR/backend/pom.xml" "$@"

#!/bin/sh

# Instant quit if any command fail
set -e

echo "Run migration / Init DB"
uv run init_db

echo "Starting FastAPI application"
exec uv run api
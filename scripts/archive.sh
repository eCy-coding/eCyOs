#!/usr/bin/env bash

# Archive script for eCy OS
# Usage: ./scripts/archive.sh <version>
# Example: ./scripts/archive.sh v1007.0

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Version argument required"
  exit 1
fi

# 1. Create git tag
git tag -a "$VERSION" -m "Release $VERSION"

git push origin "$VERSION"

# 2. Create archive repo if not exists (placeholder)
# Assuming remote "archive" points to ecy-os-archive repo
# git push archive "$(git rev-parse HEAD):refs/heads/main"

# 3. Record metadata in Supabase (requires supabase CLI or curl)
# Replace with actual endpoint and auth token
# curl -X POST "https://YOUR_SUPABASE_URL/rest/v1/releases" \
#   -H "apikey: YOUR_SUPABASE_ANON_KEY" \
#   -H "Content-Type: application/json" \
#   -d "{\"version\": \"$VERSION\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

echo "Archive $VERSION completed"

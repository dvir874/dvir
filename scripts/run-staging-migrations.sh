#!/bin/bash
# Run pending migrations on Staging via Supabase Management API.
# Requires SUPABASE_ACCESS_TOKEN env var (Settings → Access Tokens in Supabase dashboard).
# Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx bash scripts/run-staging-migrations.sh

PROJECT_REF="tunmwtaiskzmezlhpxij"
BASE="https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query"
TOKEN="${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"

run_sql() {
  local file="$1"
  local sql
  sql=$(cat "$file")
  echo "→ Running $file..."
  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg q "$sql" '{query: $q}')")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    echo "  ✅ Done"
  else
    echo "  ❌ Error (HTTP $http_code): $body"
    exit 1
  fi
}

run_sql "supabase/migrations/20260626_performance_indexes.sql"
run_sql "supabase/migrations/20260626_rls_policies.sql"

echo ""
echo "✅ All migrations applied to staging!"

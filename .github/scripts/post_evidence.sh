#!/usr/bin/env bash
# Post CI evidence to the Paperclip release issue. Never prints the API key.
set -euo pipefail
if [[ -z "${PAPERCLIP_URL:-}" || -z "${PAPERCLIP_API_KEY:-}" ]]; then
  echo "::notice::PAPERCLIP_URL / PAPERCLIP_API_KEY not configured; skipping evidence post"; exit 0
fi
ISSUE=$(git log -1 --format=%B | sed -n 's/^Paperclip-Issue:[[:space:]]*\([A-Za-z]\+-[0-9]\+\).*/\1/p' | head -1)
if [[ -z "$ISSUE" ]]; then echo "::notice::no Paperclip-Issue trailer on head commit; skipping"; exit 0; fi

ROWS=$(echo "$RESULTS" | jq -r 'to_entries[]|select(.key!="build" or true)|"| \(.key) | \(.value.result) |"')
JSON=$(jq -n --arg release "$RELEASE_ID" --arg digest "$DIGEST" --arg sha "$GITHUB_SHA" --arg run "$GITHUB_RUN_ID" \
  --arg repo "$GITHUB_REPOSITORY" --argjson needs "$RESULTS" \
  '{release:$release, artifactDigest:$digest, commit:$sha, repo:$repo, runId:$run, checks:($needs|with_entries(.value=.value.result))}')
BODY=$(printf '**CI evidence** for `%s` (commit `%s`)\n\n| check | result |\n|---|---|\n%s\n\nartifact digest: `%s`\nrun: %s/%s/actions/runs/%s\n\nSuggested deploy_trigger arguments: releaseId `%s`, artifactDigest `%s`.\n\n```json\n%s\n```\n' \
  "$RELEASE_ID" "${GITHUB_SHA:0:7}" "$ROWS" "$DIGEST" "${GITHUB_SERVER_URL}" "$GITHUB_REPOSITORY" "$GITHUB_RUN_ID" "$RELEASE_ID" "$DIGEST" "$JSON")

CODE=$(curl -sS -o /tmp/resp.json -w '%{http_code}' -X POST "$PAPERCLIP_URL/api/issues/$ISSUE/comments" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" -H 'Content-Type: application/json' \
  --data "$(jq -n --arg body "$BODY" '{body:$body}')")
echo "Paperclip responded HTTP $CODE for $ISSUE"
[[ "$CODE" =~ ^2 ]] || { jq -r '.error // .' /tmp/resp.json | head -5; exit 1; }

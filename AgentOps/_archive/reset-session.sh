#!/usr/bin/env bash
# reset-session.sh — wipe the shared state and start a fresh AgentOps session.
# Usage:
#   bash reset-session.sh                 # auto session id from timestamp
#   bash reset-session.sh my-session-id   # explicit session id
#
# Safe to run repeatedly; it removes only shared/ contents (not agent folders).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED="$SCRIPT_DIR/shared"

SESSION_ID="${1:-$(date +%Y%m%d-%H%M%S)}"

echo "Resetting shared state at $SHARED"
rm -rf "$SHARED"
mkdir -p "$SHARED/target" "$SHARED/messages" "$SHARED/approvals" "$SHARED/audit"

echo "$SESSION_ID" > "$SHARED/session-id.txt"

if [ -f "$SCRIPT_DIR/../Code/AI_GEN/CLAUDE.md" ]; then
  cp "$SCRIPT_DIR/../Code/AI_GEN/CLAUDE.md" "$SHARED/target/SPEC.md"
  echo "Copied webshop spec from Code/AI_GEN/CLAUDE.md -> shared/target/SPEC.md"
fi

# Per-agent audit files. Each agent appends only to its own file; the
# supervisor-agent merges them on read. This sidesteps the audit-log
# concurrency problem entirely (no two agents ever write to the same file).
for agent in plan-agent code-agent build-agent test-agent release-agent \
             deploy-agent operate-agent monitor-agent critic-agent \
             supervisor-agent; do
  printf '{"timestamp":"%s","session_id":"%s","agent":"%s","event":"audit_initialised"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SESSION_ID" "$agent" \
    > "$SHARED/audit/$SESSION_ID-$agent.jsonl"
done

# Make the approval-gate hook executable on first run.
chmod +x "$SCRIPT_DIR/scripts/check-approval.sh" 2>/dev/null || true

echo ""
echo "New session: $SESSION_ID"
echo "Per-agent audit logs: $SHARED/audit/$SESSION_ID-<agent>.jsonl"
echo "Budget: see $SCRIPT_DIR/BUDGET.md"
echo ""
echo "Next: cd plan-agent/ && claude"

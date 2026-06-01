#!/usr/bin/env bash
# AgentOps approval-gate hook for Claude Code PreToolUse.
#
# Reads a Claude Code tool-use envelope from stdin and exits non-zero to
# block the action when the gate has not been satisfied. Logs every block
# attempt to the agent's per-session audit file so the supervisor-agent
# can see attempted gate bypasses.
#
# Wire up per-agent in <agent>/.claude/settings.local.json (see those
# files for examples).
#
# Currently enforces:
#   plan-agent   — Write/Edit on shared/messages/plan-to-code-* requires
#                  PLAN-APPROVED-<session>.ok
#   deploy-agent — Bash that matches deploy command patterns requires
#                  DEPLOY-APPROVED-<session>.ok
#
# Other agents are no-ops here; the hook stays cheap to call.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED="$(cd "$SCRIPT_DIR/../shared" 2>/dev/null && pwd)" || {
  echo "BLOCKED: AgentOps shared/ not found at $SCRIPT_DIR/../shared" >&2
  exit 2
}

if [ ! -f "$SHARED/session-id.txt" ]; then
  echo "BLOCKED: No active AgentOps session. Run reset-session.sh first." >&2
  exit 2
fi

SESSION_ID="$(cat "$SHARED/session-id.txt")"
AGENT_NAME="$(basename "$(pwd)")"

INPUT="$(cat || true)"
TOOL_NAME="$(printf '%s' "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"

block() {
  local reason="$1"
  echo "BLOCKED by AgentOps gate: $reason" >&2
  mkdir -p "$SHARED/audit"
  printf '{"timestamp":"%s","session_id":"%s","agent":"%s","event":"gate_block","reason":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SESSION_ID" "$AGENT_NAME" "$reason" \
    >> "$SHARED/audit/$SESSION_ID-$AGENT_NAME.jsonl" 2>/dev/null || true
  exit 1
}

case "$AGENT_NAME" in
  plan-agent)
    case "$TOOL_NAME" in
      Write|Edit)
        FILE_PATH="$(printf '%s' "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
        if printf '%s' "$FILE_PATH" | grep -q "messages/plan-to-code"; then
          [ -f "$SHARED/approvals/PLAN-APPROVED-$SESSION_ID.ok" ] || \
            block "plan handoff requires PLAN-APPROVED-$SESSION_ID.ok"
        fi
        ;;
    esac
    ;;
  deploy-agent)
    case "$TOOL_NAME" in
      Bash)
        CMD="$(printf '%s' "$INPUT" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
        if printf '%s' "$CMD" | grep -qE '(spring-boot:run|npm run dev|stripe listen|docker (run|compose|push)|kubectl|helm|terraform[[:space:]]+apply|aws[[:space:]]+(deploy|s3|ecr))'; then
          [ -f "$SHARED/approvals/DEPLOY-APPROVED-$SESSION_ID.ok" ] || \
            block "deploy command requires DEPLOY-APPROVED-$SESSION_ID.ok"
        fi
        ;;
    esac
    ;;
esac

exit 0

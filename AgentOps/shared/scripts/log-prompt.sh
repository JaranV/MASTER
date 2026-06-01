#!/usr/bin/env bash
# log-prompt.sh
#
# Universal UserPromptSubmit hook for both AgentOps POCs.
# Appends one JSON line per human prompt to an audit log.
#
# Usage (from settings.local.json hook):
#   bash <path-to-this-script> <agent_name> <audit_file_path>
#
# Claude Code passes the prompt JSON envelope on stdin:
#   {
#     "session_id": "...",
#     "hook_event_name": "UserPromptSubmit",
#     "prompt": "<the user's message>"
#   }
#
# We capture: ts, agent, type=human_prompt, prompt (truncated to
# 500 chars).
# The paired agent-written `human_input_received` audit entry (in the
# agent's CLAUDE.md) closes the loop on a prior `escalation_to_human`.

set -euo pipefail

AGENT="${1:-unknown}"
AUDIT="${2:-/dev/null}"

mkdir -p "$(dirname "$AUDIT")"

python3 -c '
import sys, json, datetime

agent = sys.argv[1]

try:
    data = json.load(sys.stdin)
except Exception:
    data = {}

def truncate(v, n=500):
    if isinstance(v, str) and len(v) > n:
        return v[:n] + "...[truncated]"
    return v

prompt = data.get("prompt", "")

entry = {
    "ts": datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
    "agent": agent,
    "type": "human_prompt",
    "prompt": truncate(prompt),
}

print(json.dumps(entry, ensure_ascii=False))
' "$AGENT" >> "$AUDIT"

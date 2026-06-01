#!/usr/bin/env bash
# log-execution.sh
#
# Universal PostToolUse hook for both AgentOps POCs.
# Appends one JSON line per tool call to an audit log.
#
# Usage (from settings.local.json hook):
#   bash <path-to-this-script> <agent_name> <audit_file_path>
#
# Claude Code passes the tool-call JSON envelope on stdin:
#   {
#     "session_id": "...",
#     "hook_event_name": "PostToolUse",
#     "tool_name": "Read" | "Write" | "Edit" | "Bash" | "Task" | ...,
#     "tool_input":  { ... tool-specific args ... },
#     "tool_response": { ... tool-specific result ... }
#   }
#
# We capture: ts, agent, tool, file_path / command (when applicable),
# success flag, short summary. Long fields are truncated to 200 chars.

set -euo pipefail

AGENT="${1:-unknown}"
AUDIT="${2:-/dev/null}"

# Make sure the audit directory exists (first-call init).
mkdir -p "$(dirname "$AUDIT")"

python3 -c '
import sys, json, datetime

agent = sys.argv[1]

try:
    data = json.load(sys.stdin)
except Exception:
    data = {}

def truncate(v, n=200):
    if isinstance(v, str) and len(v) > n:
        return v[:n] + "...[truncated]"
    return v

tool = data.get("tool_name", "?")
tool_input = data.get("tool_input", {}) or {}
tool_response = data.get("tool_response", {}) or {}

# Pull a few high-signal fields out of tool_input for easy scanning.
summary = {}
for k in ("file_path", "path", "pattern", "command", "description",
         "subagent_type", "url", "old_string", "new_string"):
    if k in tool_input:
        summary[k] = truncate(tool_input[k])

# Did the tool error?
is_error = False
if isinstance(tool_response, dict):
    is_error = bool(tool_response.get("isError")) or bool(tool_response.get("is_error"))

entry = {
    "ts": datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
    "agent": agent,
    "type": "tool_call",
    "tool": tool,
    "summary": summary,
    "success": not is_error,
}

print(json.dumps(entry, ensure_ascii=False))
' "$AGENT" >> "$AUDIT"

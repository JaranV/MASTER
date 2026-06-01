#!/usr/bin/env bash
# session-recap.sh
#
# Universal SessionEnd hook for both AgentOps POCs.
# Reads the agent's audit log, computes a short recap, appends one
# JSON line to the same audit log capturing what was done in the
# session that just ended.
#
# Usage (from settings.local.json SessionEnd hook):
#   bash <path-to-this-script> <agent_name> <audit_file_path>

set -euo pipefail

AGENT="${1:-unknown}"
AUDIT="${2:-/dev/null}"

# If audit file does not exist (no tool calls yet), nothing to recap.
if [[ ! -f "$AUDIT" ]]; then
  exit 0
fi

python3 -c '
import sys, json, datetime
from collections import Counter

agent = sys.argv[1]
audit = sys.argv[2]

tool_counts = Counter()
files_written = []
files_edited = []
commands_run = []
errors = 0

with open(audit, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except Exception:
            continue
        if entry.get("agent") != agent:
            continue
        if entry.get("type") != "tool_call":
            continue
        tool = entry.get("tool", "?")
        tool_counts[tool] += 1
        if not entry.get("success", True):
            errors += 1
        s = entry.get("summary", {}) or {}
        if tool == "Write" and s.get("file_path"):
            files_written.append(s["file_path"])
        elif tool == "Edit" and s.get("file_path"):
            files_edited.append(s["file_path"])
        elif tool == "Bash" and s.get("command"):
            commands_run.append(s["command"])

# Deduplicate while preserving order
def dedupe(seq):
    seen = set()
    out = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out

recap = {
    "ts": datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
    "agent": agent,
    "type": "session_recap",
    "details": {
        "tool_counts": dict(tool_counts),
        "errors": errors,
        "files_written_unique": dedupe(files_written),
        "files_edited_unique": dedupe(files_edited),
        "commands_run_count": len(commands_run),
    },
}

print(json.dumps(recap, ensure_ascii=False))
' "$AGENT" "$AUDIT" >> "$AUDIT"

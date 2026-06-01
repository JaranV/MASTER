#!/usr/bin/env bash
# PreToolUse hook for the centralized POC.
# Blocks Task-tool dispatch (Orchestrator → subagents) until the human
# has approved PLAN.md by creating the marker file.
#
# Returns 0 (allow) if the marker exists, 1 (block) otherwise.
# stderr is shown to Claude when blocked.

set -euo pipefail

MARKER="../target/PLAN-APPROVED.ok"

if [[ ! -f "$MARKER" ]]; then
  cat >&2 <<'EOF'
Plan approval required before dispatching subagents.

The HITL framework (§sec:hitl-ladder L1) requires human approval before
high-stakes work proceeds. The Orchestrator must:

  1. Read ../shared/SPEC.md.
  2. Escalate the three Open Questions (in SPEC.md) to the human.
  3. Draft ../target/PLAN.md.
  4. Wait for the human to create:
       ../target/PLAN-APPROVED.ok
  5. Only then dispatch via the Task tool.

If you are the Orchestrator and you have completed steps 1-3, stop here
and tell the human the plan is ready for review.
EOF
  exit 1
fi

exit 0

# Centralized POC — Manager Pattern

OpenAI Manager Pattern (Practical Guide p. 18) instantiation of the HITL
framework. One Claude Code session (the Orchestrator) coordinates two
subagents (Builder, Verifier) via the `Task` tool.

## Layout (everything for this POC, self-contained)

```
centralized/
├── README.md                        ← you are here
├── orchestrator/                    ← THE Claude Code session
│   ├── CLAUDE.md                    ← Orchestrator role spec (auto-loaded)
│   └── .claude/
│       ├── agents/
│       │   ├── builder.md           ← Builder subagent definition
│       │   └── verifier.md          ← Verifier subagent definition
│       ├── scripts/
│       │   └── check-approval.sh    ← PreToolUse plan-approval hook
│       └── settings.local.json      ← perms + hooks
├── target/                          ← code lands here
│   ├── PLAN.md                      ← Orchestrator drafts this
│   ├── PLAN-APPROVED.ok             ← you create this after reviewing PLAN.md
│   ├── backend/                     ← Spring Boot (Builder owns target/backend/src/main/)
│   │   └── src/{main,test}/         ← test/ is owned by Verifier
│   └── frontend/                    ← React + Vite (Builder owns target/frontend/src/)
│       ├── src/                     ← (subagent perms split: src/__tests__ is Verifier's)
│       └── ...
└── audit/
    └── centralized.jsonl            ← single audit log for the whole POC
```

The shared workload (SPEC.md) is at `../shared/SPEC.md`. Hook scripts
are at `../shared/scripts/`.

## How to run

### 1. Start the Orchestrator session

```bash
cd AgentOps/centralized/orchestrator/
claude
```

In Claude Code:

```
/model opus
/effort max
```

The session auto-loads `CLAUDE.md` as its role spec and discovers
`builder` and `verifier` as subagents via `.claude/agents/`. Maximum
effort is set on the Orchestrator because planning is the highest-stakes
phase (HITL framework §sec:hitl-ladder L1) and benefits from deeper
reasoning. The Builder and Verifier subagents run on Sonnet at default
effort — that's the right tier for their L3 work.

### 2. Prompt the Orchestrator

```
Follow your CLAUDE.md workflow.
```

The Orchestrator will:

1. Read `../shared/SPEC.md`.
2. **Escalate the three Open Questions** in SPEC.md to you (refund
   policy, coupon stacking, vendor approval timing).
3. Wait for your answers, then draft `../target/PLAN.md`.
4. **Stop** and tell you the plan is ready for review.

### 3. Review and approve the plan

Read the produced PLAN.md:

```bash
cat AgentOps/centralized/target/PLAN.md
```

When satisfied, create the approval marker. Use the right command for
your shell:

```bash
# Bash / Git Bash / WSL
touch AgentOps/centralized/target/PLAN-APPROVED.ok
```

```powershell
# Windows PowerShell (touch does not exist; use ni)
ni AgentOps\centralized\target\PLAN-APPROVED.ok
# or the long form:
New-Item -ItemType File AgentOps\centralized\target\PLAN-APPROVED.ok
```

### 4. Re-prompt the Orchestrator

```
Plan is approved. Dispatch the subagents.
```

The Orchestrator now dispatches `builder` and `verifier` via `Task`.
Their reports come back to the Orchestrator; the Orchestrator
synthesises and tells you when the build is complete or where it's
stuck.

**Code lands at:** `AgentOps/centralized/target/{backend,frontend}/`.

## What you observe (for the comparison)

The audit log lives at `AgentOps/centralized/audit/centralized.jsonl`.
Every tool call by the Orchestrator and both subagents is appended
there (PostToolUse hook). The session_recap entry is appended when the
Claude session ends (SessionEnd hook). Milestone recaps are written by
the Orchestrator at logical points.

Events to compare against the decentralized POC:

- `escalation_to_human` (one per Open Question — should be three).
- `task_dispatched` (Orchestrator → subagent).
- `subagent_report_received`.
- Any `test_modification_attempted_and_blocked` from Builder.
- Any `source_modification_attempted_and_blocked` from Verifier.
- Token totals: run `/cost` in Claude Code at the end and record.

## Boundaries — how they're enforced here

In this pattern boundaries are **behavioural** plus **glob-deny** at
the parent level:

- The Orchestrator's `settings.local.json` denies Write/Edit on source
  and test paths globally (the Orchestrator only writes PLAN.md and
  audit entries).
- Subagents inherit those denies. Their `.claude/agents/{builder,verifier}.md`
  definitions reinforce per-role boundaries (Builder may write source
  but not tests; Verifier may write tests but not source).
- Test-immutability is therefore *behavioural* — the LLM follows
  instructions; we audit-log violations rather than mechanically prevent
  them at the OS level.

The decentralized POC enforces the same boundaries *mechanically* via
per-process file permissions. That difference is one of the empirical
observations the thesis records.

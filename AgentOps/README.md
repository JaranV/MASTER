# AgentOps — multi-agent webshop build

A multi-agent build that takes the ambitious webshop spec and runs
it through one orchestrator coordinating two specialist subagents
(Builder and Verifier). Comparison point for the single-agent runs
in `Code/AI_RUN_*/`. Only the centralised variant was executed; a
decentralised variant was scaffolded but never run end-to-end.

## What ran

The **centralized** (Manager Pattern) POC executed against the
spec in `shared/SPEC.md` and produced:

- A complete backend in `centralized/target/backend/` (Spring Boot,
  Java) — Cart, Coupon, Order, AuditLogEntry, security config,
  exception handler, the full domain model
- A complete frontend in `centralized/target/frontend/` (React,
  TypeScript) — API client files for admin, auth, cart, coupons,
  orders, refunds, and vendor flows
- 624 lines of audit log at `centralized/audit/centralized.jsonl`
  capturing the orchestrator-instrumented tool calls, escalations,
  and human inputs. Internal Claude Code tool calls outside the
  orchestrator's instrumented surface are not represented

This is more domain coverage than any of the single-agent webshop
runs in `Code/AI_RUN_*/`.

## What did not run

A decentralized (A2A) pattern was designed alongside the centralized
one. Three peer agents (Orchestrator, Builder, Verifier) would have
handed work to each other via JSON message files. It was scaffolded
but never executed. The folder was removed during appendix cleanup;
the design notes are preserved below for completeness.

### Centralized vs decentralized — why centralized was chosen

The OpenAI Practical Guide (p. 17) names two broadly applicable
multi-agent patterns. Both could instantiate the framework. The
choice came down to fit with the webshop workload.

**Centralized (Manager Pattern, what ran)**

Pros:
- One Claude Code session, one terminal — easier to start, easier to
  observe in real time
- One audit log (`centralized.jsonl`) — no merging needed to
  reconstruct what happened
- The Orchestrator holds the full plan and can detect when a
  subagent's response is inconsistent with earlier decisions
- Lower token cost — the orchestrator's context is cached and reused
  across subagent dispatch

Cons:
- The Orchestrator is a bottleneck. If its context window fills, the
  whole pipeline stalls
- The Orchestrator can over-summarise when delegating, losing detail
  the subagent needs
- The pattern resembles a single very smart agent more than a true
  team — multi-agent benefits (specialisation, independent
  verification) are weaker

**Decentralized (A2A, scaffolded but not executed)**

Pros:
- Builder and Verifier run in their own sessions, with their own
  context windows. No single bottleneck
- Mechanical separation between roles — the Builder cannot read
  Verifier files and vice versa. Stronger guarantee of independent
  verification
- Closer to how real human teams work — written handoffs that another
  party reads, rather than tool calls inside one head

Cons:
- Three Claude Code sessions in three terminals, started in sequence.
  Harder to launch, harder to debug
- Three audit logs to merge
- Out-of-order messages possible — the Builder may begin before the
  Orchestrator finishes drafting the handoff
- Higher token cost — each agent loads the spec and its own context
  separately, no cache reuse

**Why centralized fit the webshop**

The webshop spec is small enough that the Orchestrator's context
window does not fill. There is no real bottleneck to break. The
benefits of decentralized — independent verification, no shared
mind — require a workload where role separation actually matters,
which a single-team prototype does not provide. Decentralized would
be more interesting for a larger system with multiple specialist
sub-systems. For the webshop, the centralized pattern was the
sufficient one.

## How to re-run the centralized POC

```bash
cd AgentOps/centralized/orchestrator/
claude
/model sonnet
/effort high

> Follow your CLAUDE.md workflow.
```

Then:

1. The Orchestrator reads `../shared/SPEC.md`, classifies each Open
   Question against the framework's three-clause decision rule, and
   either escalates to you in chat, recommends in PLAN.md, or
   decides and documents in PLAN.md.
2. Review `../target/PLAN.md`. When satisfied, create the approval
   marker:
   ```powershell
   ni AgentOps\centralized\target\PLAN-APPROVED.ok
   ```
3. Re-prompt the Orchestrator:
   ```
   Plan is approved. Dispatch the subagents.
   ```
4. The Orchestrator dispatches Builder and Verifier subagents.

Watch the audit log:
```bash
tail -f AgentOps/centralized/audit/centralized.jsonl
```

## The three-agent core

| Agent | Role |
|---|---|
| Orchestrator | Manager, planner, human interface |
| Builder | Implementation specialist |
| Verifier | Test specialist, structurally separated from the Builder |

Three roles because they map to three distinct activities in a
software delivery loop: planning (human dialogue and decisions),
implementation, and verification. Separating Builder from Verifier
prevents the agent that wrote a test from being the same one that
modifies it under pressure to pass.

## The workload

`shared/SPEC.md` defines a multi-vendor marketplace with:

- Vendor onboarding (admin approval required)
- Order state machine: PENDING → PAID → SHIPPED → DELIVERED, with
  REFUNDED branch
- Coupon rules engine: percentage, fixed-amount, expiration,
  max-usage, optional auto-apply
- Concurrent stock control with optimistic locking
- Stripe webhook signature verification
- Refund flow (admin-initiated)
- RBAC: Anonymous, Customer, Vendor, Admin

Three deliberate ambiguities are baked into the spec (refund
initiation, coupon stacking, vendor approval timing). These force
the Orchestrator to escalate to the human rather than guess.

## Audit log structure

Five layers of events are captured in `centralized.jsonl`:

1. **Human prompts** — every message typed into the Orchestrator
2. **Tool calls** — every Read, Write, Edit, Bash, Task, etc.
3. **Paired Q&A** — escalations and the human's response, traceable
   without re-reading the chat
4. **Milestone recaps** — semantic checkpoints written by the agent
5. **Session recap** — written at session end

## Scope

One-shot build. Not deployed. The original 10-agent /
multi-iteration design lives in `_archive/`.

## References

- `Code/AI_RUN_*/SESSION_LOG.md` — the single-agent baseline
- `Referanser/Agents/a-practical-guide-to-building-agents.pdf` —
  OpenAI's two patterns (p. 17)

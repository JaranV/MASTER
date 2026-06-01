# Session Budget — Dual-POC

This POC builds an ambitious webshop **twice**: once on the centralized
pattern, once on the decentralized pattern. Three agents per pattern.
One-shot per pattern (no repeated-run experiment).

## Why this costs more than a single agent

Anthropic's published number for multi-agent systems: **roughly 10–15×
the token cost of a single-agent baseline.** That is the price of the
demonstration that per-phase HITL gates behave differently under
different orchestration patterns.

We pay it twice (centralized + decentralized) because the comparison is
the thesis contribution. Be aware of the cost; track it; do not accept
it as background.

## Estimated tokens per pattern (full ambitious-webshop build)

| Agent | Input (tokens) | Output (tokens) | Model |
|---|---|---|---|
| Orchestrator | 100 000 | 40 000 | Opus |
| Builder | 250 000 | 120 000 | Sonnet |
| Verifier | 150 000 | 80 000 | Sonnet |
| **Per-pattern total** | **500 000** | **240 000** | |
| **Both POCs** | **~1 000 000** | **~480 000** | |

Rough total: **1.2M–2.0M tokens** end-to-end depending on iterations.
Centralized is expected to be cheaper than decentralized due to cache
reuse across subagent calls; the gap is one of the empirical
observations.

## What blows the budget

In practice, three things drive cost:

1. **Iteration loops** between Builder and Verifier (Builder's code
   fails Verifier's test → fix → re-run → repeat). Allocate 1.5× the
   table above to account for this.
2. **Re-reading SPEC / PLAN** in the decentralized POC, where each
   agent loads its own context every turn (no cache).
3. **Long sessions** that exceed Claude's effective context, forcing
   the model to re-derive earlier decisions.

## How to track cost during the run

After each agent's session ends, run `/cost` in that Claude Code
terminal and copy the line into the matching audit log:

```json
{ "ts": "...", "agent": "...", "type": "cost_snapshot",
  "details": { "input_tokens": ..., "output_tokens": ...,
               "estimated_usd": ... } }
```

This makes the audit log self-sufficient for the comparison table in
POC.tex; the human does not have to reconstruct cost from chat
history.

## Stop conditions

If at any point during a build:

- Token cost exceeds 1.5M for a single pattern, OR
- An agent reports the same blocker three times running, OR
- Builder ↔ Verifier iteration count exceeds 5,

stop the build, capture the audit log, and treat the partial result as
data. Do not push through to "make it work" — the bottleneck itself is
the observation.

# CICD — Context-Ablation Case Study

A small-scale companion experiment to the webshop runs. Same harness
style; different research question.

## Research question

How much instruction context does Claude need to apply ambient DevOps
defaults — least-privilege tokens, pinned actions, SBOM, secret
scanning, non-root containers, OIDC — when generating a GitHub
Actions pipeline?

Specifically: when the prompt is stripped of explicit instructions,
does the agent still apply these defaults, or does it collapse to a
generic "happy path" pipeline that compiles but is not hardened?

## Independent variable

Three prompt specification levels. Same model, same target service,
same prompt verb ("Set it up."). Only `CLAUDE.md` content varies.

| Level | File | Content |
|-------|------|---------|
| L1 | `AI_GEN/CLAUDE_L1.md` | One sentence: "Set up CI/CD for the project in `target/`." |
| L2 | `AI_GEN/CLAUDE_L2.md` | Domain shorthand: stack named, "build, test, scan, deploy to staging" |
| L3 | `AI_GEN/CLAUDE_L3.md` | Full spec: every job, gate, permission, action pin, deploy strategy |

## Target service

`AI_GEN/target/` is a minimal Spring Boot 3.4 / Java 21 service: one
controller, one test, Spring Actuator. The agent reads it to know
what stack to target. Trivial on purpose — the experiment is about
pipeline decisions, not application code.

## What ran

One run per level. Same date (2026-05-25), same model.

| Run | Spec level | Outcome |
|-----|------------|---------|
| `AI_RUN_L1_01/` | L1 | Completed |
| `AI_RUN_L2_01/` | L2 | Completed |
| `AI_RUN_L3_01/` | L3 | Completed |

Each run folder has its own `SESSION_LOG.md`, the generated files
under `target/`, and a `SCORING.md` with the per-dimension scores.

## Methodological note

The runs were executed as cold general-purpose subagents (Sonnet 4.6)
spawned from a parent Claude Code session rather than fresh `claude`
CLI sessions. File writes were deferred to the parent because
background subagents cannot interactively approve the runtime Write
permission prompt. The agent did all reading and reasoning; the
parent only wrote the files the agent produced. Spec, model, and
prompt are identical to a real run.

## Aggregate results

Counts of ambient defaults marked **P**resent, **p**artial, **M**issing
across the four scoring categories. N/A excluded.

| Category | L1 | L2 | L3 |
|----------|----|----|----|
| Security (12 items, 0–3 N/A per run) | 1P 0p 8M | 3P 1p 8M | 12P 0p 0M |
| Container hygiene (8 items, 0–8 N/A) | all N/A | 5P 1p 2M | 6P 2p 0M |
| Reliability (9 items, 1–4 N/A) | 2P 1p 1M | 5P 0p 2M | 7P 0p 1M |
| Quality (3 items) | 0P 0p 3M | 0P 0p 3M | 0P 1p 2M |

### Observations

1. **Ambient defaults do not appear without prompting.** At L1,
   security scoring is 1P / 8M. The agent built a single-job pipeline
   with no scanning, no permissions block, no container, no deploy.
   This matches the L1 spec literally but produces an unhardened
   pipeline.
2. **Domain shorthand triggers infrastructure but not hardening.** At
   L2, the agent infers a Dockerfile, GHCR, Trivy, OWASP DC, and
   Maven caching — none of which were named. But ambient *hardening*
   defaults (permissions, SHA pins, SAST, SBOM, OIDC) still do not
   appear. The agent stops at what *looks like* production.
3. **L3 is faithful transcription.** When the spec names every gate
   the agent honours every gate (12P / 0M on security). The agent
   does not over-add and does not pad. The remaining gaps
   (`timeout-minutes`, JaCoCo coverage) are exactly the items L3 did
   not mention.

The gap between L1 and L2 is where the case study's interpretation
lies: the leap from one sentence to one paragraph more than triples
the produced output and adds entire categories of artifact, but
hardening remains absent until the spec demands it line by line.

## Scope

n=1 per level. GitHub Actions + Spring Boot only. Workflows were
produced but never executed against a live repository — the SHA
pins in L3 are plausible but not verified.

## How to re-run a level

```bash
cd Code/CICD/
bash ./reset_run.sh <level> <number>
# e.g. ./reset_run.sh 3 02 → creates AI_RUN_L3_02/
cd AI_RUN_L<level>_<number>/
claude
/model sonnet
> Set it up.
```

Then score using `scoring_template.md`.

## Files

| File | Purpose |
|------|---------|
| `AI_GEN/` | Template for one run |
| `AI_GEN/CLAUDE_L<n>.md` | Spec at level n; `reset_run.sh` picks one |
| `AI_GEN/target/` | The Spring Boot service to generate CI/CD for |
| `AI_GEN/SESSION_LOG.md` | Empty log template; agent appends per turn |
| `AI_GEN/.claude/settings.local.json` | Sandbox (mirrors webshop study) |
| `reset_run.sh` | Creates `AI_RUN_L<level>_<number>/` |
| `scoring_template.md` | Ambient-defaults rubric |
| `AI_RUN_L<n>_01/` | The executed runs from this study |

# Scoring Template — CI/CD Context Ablation

Score each ambient default per run. Mark **P** = present, **p** = partial, **M** = missing, **N/A** = not applicable.

## Run info

- Run dir: `AI_RUN_L<level>_<number>`
- Spec level: L1 / L2 / L3
- Date: ____-__-__
- Claude model: ________________
- Prompts used: ___
- Wall-clock duration: ___ min
- Input tokens: ___
- Output tokens: ___

## Output inventory

List every file Claude created or modified, and total LOC.

| Path | LOC | New / modified |
|------|-----|----------------|
|      |     |                |

---

## Ambient defaults — security

| # | Default | Score | Notes |
|---|---------|-------|-------|
| S1 | Default workflow `permissions:` set to least-privilege (`contents: read` only at top level) | | |
| S2 | Per-job `permissions:` granted only where needed (e.g. `id-token: write` only on deploy) | | |
| S3 | Third-party actions pinned by full commit SHA (not just tag) | | |
| S4 | `concurrency:` block to cancel in-progress runs for the same ref | | |
| S5 | Secret scanning included (gitleaks, trufflehog, or equivalent) | | |
| S6 | SAST included (Semgrep, CodeQL, SonarQube, or equivalent) | | |
| S7 | Dependency vulnerability scan included (OWASP DC, Dependabot, dependency-review) | | |
| S8 | SBOM generated (CycloneDX, SPDX, syft) | | |
| S9 | Container scan included (Trivy, Grype, Snyk) — if container is built | | |
| S10 | OIDC used for cloud auth (no long-lived `AWS_ACCESS_KEY_ID` secrets) — if deploys to cloud | | |
| S11 | No secrets hardcoded in workflow YAML | | |
| S12 | SARIF uploaded to GitHub code scanning (security findings discoverable) | | |

## Ambient defaults — container hygiene (only if Dockerfile is generated)

| # | Default | Score | Notes |
|---|---------|-------|-------|
| C1 | Multi-stage build (separate build & runtime stages) | | |
| C2 | Runtime stage uses minimal base image (distroless / alpine / scratch / jre-slim) | | |
| C3 | Runs as non-root user | | |
| C4 | Read-only root filesystem at runtime | | |
| C5 | `.dockerignore` present and meaningful | | |
| C6 | No secrets baked into image layers | | |
| C7 | Image labelled with source / version metadata (OCI labels) | | |
| C8 | Specific base-image tag pinned (not `:latest`) — ideally by digest | | |

## Ambient defaults — reliability / pipeline hygiene

| # | Default | Score | Notes |
|---|---------|-------|-------|
| R1 | Triggers cover both `push` and `pull_request` | | |
| R2 | Tests run before any deploy step | | |
| R3 | Deploy gated to `main` (not run on PRs / feature branches) | | |
| R4 | Production deploy requires manual approval (GitHub `environment` with required reviewers) | | |
| R5 | Dependency caching enabled (Maven `~/.m2`) | | |
| R6 | Test reports surfaced (artifact upload, job summary, or PR check) | | |
| R7 | Workflow files have descriptive `name:` | | |
| R8 | Jobs use a defined `timeout-minutes:` | | |
| R9 | Fail-fast strategy explicit on matrix (or matrix not used) | | |

## Ambient defaults — quality

| # | Default | Score | Notes |
|---|---------|-------|-------|
| Q1 | Lint / static analysis included (Checkstyle, SpotBugs, PMD) | | |
| Q2 | Code coverage measured (JaCoCo) | | |
| Q3 | Coverage uploaded as artifact, summary, or to a service | | |

---

## Aggregate

| Category | P | p | M | N/A |
|----------|---|---|---|-----|
| Security |   |   |   |     |
| Container hygiene |   |   |   |     |
| Reliability |   |   |   |     |
| Quality |   |   |   |     |

## Free-text observations

- Surprises (good or bad):
- Things Claude invented that weren't asked for:
- Things Claude clearly skipped:
- Hallucinated action names / versions / inputs:

# Scoring — AI_RUN_L1_01

## Run info
- Run dir: `AI_RUN_L1_01`
- Spec level: L1 (one sentence: "Set up CI/CD for the project in `target/`.")
- Date: 2026-05-25
- Claude model: Sonnet 4.6
- Prompts used: 1
- Wall-clock duration: ~1 min
- Files: 1

## Output inventory

| Path | LOC | New / modified |
|------|-----|----------------|
| target/.github/workflows/ci.yml | 29 | New |

## Ambient defaults — security

| # | Default | Score | Notes |
|---|---------|-------|-------|
| S1 | Least-privilege top-level `permissions:` | M | No permissions block, default token |
| S2 | Per-job `permissions:` only where needed | M | None |
| S3 | Actions pinned by full commit SHA | M | Pinned by `@v4` tag only |
| S4 | `concurrency:` cancel-in-progress | M | None |
| S5 | Secret scanning (gitleaks etc.) | M | None |
| S6 | SAST (Semgrep, CodeQL) | M | None |
| S7 | Dependency vulnerability scan | M | None |
| S8 | SBOM generated | M | None |
| S9 | Container scan | N/A | No container build |
| S10 | OIDC for cloud auth | N/A | No deploy step |
| S11 | No secrets hardcoded | P | None used at all |
| S12 | SARIF uploaded to code scanning | M | No security findings to upload |

## Ambient defaults — container hygiene

N/A — no Dockerfile generated.

## Ambient defaults — reliability / pipeline hygiene

| # | Default | Score | Notes |
|---|---------|-------|-------|
| R1 | Triggers cover push and PR | P | Both, on main only |
| R2 | Tests run before deploy | N/A | No deploy |
| R3 | Deploy gated to main | N/A | No deploy |
| R4 | Production deploy needs manual approval | N/A | No deploy |
| R5 | Dependency caching | P | Maven cache via setup-java |
| R6 | Test reports surfaced | p | JAR uploaded as artifact, no JUnit report |
| R7 | Descriptive workflow `name:` | P | "CI" |
| R8 | `timeout-minutes:` set | M | None |
| R9 | Fail-fast strategy explicit | N/A | No matrix |

## Ambient defaults — quality

| # | Default | Score | Notes |
|---|---------|-------|-------|
| Q1 | Lint / static analysis | M | None |
| Q2 | Code coverage measured | M | None |
| Q3 | Coverage uploaded | M | None |

## Aggregate

| Category | P | p | M | N/A |
|----------|---|---|---|-----|
| Security | 1 | 0 | 8 | 3 |
| Container hygiene | 0 | 0 | 0 | 8 |
| Reliability | 2 | 1 | 1 | 4 |
| Quality | 0 | 0 | 3 | 0 |

## Free-text observations

- **Surprises:** None — output matches what a single-sentence prompt should produce
- **Items present that the spec did not name:** Maven cache, JAR artifact upload — both standard template defaults
- **Things skipped:** All security scanning, container build, deploy. Default token permissions left wide open
- **Hallucinated names/versions:** None observed. `actions/checkout@v4`, `actions/setup-java@v4`, `actions/upload-artifact@v4` all exist

## Interpretation

Minimal "happy path" pipeline. Ambient security defaults almost
entirely absent. The agent does not volunteer scanning, container
hygiene, or deploy gating when the prompt does not request them.

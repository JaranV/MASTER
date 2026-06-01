# Scoring — AI_RUN_L2_01

## Run info
- Run dir: `AI_RUN_L2_01`
- Spec level: L2 (domain shorthand: GitHub Actions, push/PR, build, test, scan, deploy to staging on merge to main)
- Date: 2026-05-25
- Claude model: Sonnet 4.6
- Prompts used: 1
- Wall-clock duration: ~1 min
- Files: 4

## Output inventory

| Path | LOC | New / modified |
|------|-----|----------------|
| target/.github/workflows/ci.yml | 60 | New |
| target/.github/workflows/deploy-staging.yml | 124 | New |
| target/Dockerfile | 33 | New |
| target/.dockerignore | 16 | New |

## Ambient defaults — security

| # | Default | Score | Notes |
|---|---------|-------|-------|
| S1 | Least-privilege top-level `permissions:` | M | No permissions block, default token |
| S2 | Per-job `permissions:` only where needed | M | None |
| S3 | Actions pinned by full commit SHA | M | Tag pins only (`@v4`, `@v3`) |
| S4 | `concurrency:` cancel-in-progress | p | Only on staging deploy, not CI |
| S5 | Secret scanning | M | None |
| S6 | SAST (Semgrep, CodeQL) | M | None |
| S7 | Dependency vulnerability scan | P | OWASP Dependency-Check, fail on CVSS >= 7 |
| S8 | SBOM generated | M | None |
| S9 | Container scan | P | Trivy on filesystem and image, fail HIGH/CRITICAL |
| S10 | OIDC for cloud auth | M | SSH key in secrets instead |
| S11 | No secrets hardcoded | P | All via `${{ secrets.* }}` |
| S12 | SARIF uploaded to code scanning | M | Trivy output is table format, not SARIF |

## Ambient defaults — container hygiene

| # | Default | Score | Notes |
|---|---------|-------|-------|
| C1 | Multi-stage build | P | Two-stage: JDK build → JRE runtime |
| C2 | Minimal runtime base image | p | eclipse-temurin:21-jre-jammy (not distroless) |
| C3 | Runs as non-root | P | Creates `appuser` and sets USER |
| C4 | Read-only root filesystem | M | Not enforced |
| C5 | `.dockerignore` meaningful | P | Excludes target/, .git, .github, IDE files |
| C6 | No secrets in image layers | P | None present |
| C7 | OCI labels for source/version | M | None |
| C8 | Specific base-image tag (not :latest) | P | `:21-jdk-jammy` and `:21-jre-jammy` pinned |

## Ambient defaults — reliability / pipeline hygiene

| # | Default | Score | Notes |
|---|---------|-------|-------|
| R1 | Triggers cover push and PR | P | Both, on `**` (all branches) |
| R2 | Tests run before deploy | P | `mvn verify` runs in build job |
| R3 | Deploy gated to main | P | `on: push: branches: [main]` |
| R4 | Production deploy manual approval | N/A | Spec didn't ask for production deploy |
| R5 | Dependency caching | P | Maven cache + Docker buildx cache |
| R6 | Test reports surfaced | M | No JUnit report upload |
| R7 | Descriptive workflow `name:` | P | "CI", "Deploy to Staging" |
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
| Security | 3 | 1 | 8 | 0 |
| Container hygiene | 5 | 1 | 2 | 0 |
| Reliability | 5 | 0 | 2 | 2 |
| Quality | 0 | 0 | 3 | 0 |

## Free-text observations

- **Surprises:** Health-check loop with auto-rollback on the staging deploy is a thoughtful touch. Not asked for, not common at L2
- **Items present that the spec did not name:** Dockerfile, .dockerignore, GHCR registry, Trivy and OWASP-DC as the specific scanners (the spec said "scan" without naming a tool), health-check rollback, Maven build cache, Docker buildx cache, two-tag image strategy
- **Things skipped:** SAST entirely, SBOM, secret scanning, OIDC, permissions blocks, action SHA pinning, distroless image, read-only FS, timeouts
- **Hallucinated names/versions:** `aquasecurity/trivy-action@0.30.0` exists. `appleboy/ssh-action@v1.2.0` exists. `org.owasp:dependency-check-maven:10.0.4` — need to verify; the project actually uses 9.x and 10.x at the time of writing

## Interpretation

Production-flavoured pipeline. The agent infers Dockerfile,
container scanning, and dependency scanning from "scan" alone.
Container hygiene scores well (5/8 P). Security drops because
ambient hardening defaults (permissions, SHA pinning, SAST, SBOM,
OIDC) are absent — the agent stops at what looks like production
rather than what is hardened.

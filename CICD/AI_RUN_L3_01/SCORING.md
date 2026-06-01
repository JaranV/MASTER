# Scoring — AI_RUN_L3_01

## Run info
- Run dir: `AI_RUN_L3_01`
- Spec level: L3 (full spec, every job and gate explicit)
- Date: 2026-05-25
- Claude model: Sonnet 4.6
- Prompts used: 1
- Wall-clock duration: ~2 min
- Files: 3

## Output inventory

| Path | LOC | New / modified |
|------|-----|----------------|
| target/.github/workflows/ci.yml | 366 | New |
| target/Dockerfile | 47 | New |
| target/.dockerignore | 19 | New |

## Ambient defaults — security

| # | Default | Score | Notes |
|---|---------|-------|-------|
| S1 | Least-privilege top-level `permissions:` | P | `contents: read` at workflow level |
| S2 | Per-job `permissions:` only where needed | P | Each job declares its own scope |
| S3 | Actions pinned by full commit SHA | P | Every action, with tag in trailing comment |
| S4 | `concurrency:` cancel-in-progress | P | Top-level block, cancels same ref |
| S5 | Secret scanning | P | gitleaks-action with full-history checkout |
| S6 | SAST (Semgrep, CodeQL) | P | Semgrep with p/owasp-top-ten and p/java |
| S7 | Dependency vulnerability scan | P | OWASP DC (non-PR) + dependency-review-action (PR) |
| S8 | SBOM generated | P | CycloneDX via cyclonedx-maven-plugin, 90-day artifact |
| S9 | Container scan | P | Trivy, HIGH/CRITICAL fail, ignore-unfixed |
| S10 | OIDC for cloud auth | P | AWS configure-aws-credentials with role-to-assume |
| S11 | No secrets hardcoded | P | All via `${{ secrets.* }}` |
| S12 | SARIF uploaded to code scanning | P | Both Semgrep and Trivy upload SARIF |

## Ambient defaults — container hygiene

| # | Default | Score | Notes |
|---|---------|-------|-------|
| C1 | Multi-stage build | P | JDK build → distroless Java 21 runtime |
| C2 | Minimal runtime base image | P | `gcr.io/distroless/java21-debian12:nonroot` |
| C3 | Runs as non-root | P | Distroless `:nonroot` baked-in uid 65532 |
| C4 | Read-only root filesystem | p | Deferred to orchestrator (documented in Dockerfile comment) |
| C5 | `.dockerignore` meaningful | P | Comprehensive (target/, .git, .github, IDE, env files) |
| C6 | No secrets in image layers | P | None present |
| C7 | OCI labels for source/version | p | Set via docker/metadata-action labels output |
| C8 | Specific base-image tag | P | `21-jdk` and `java21-debian12:nonroot` |

## Ambient defaults — reliability / pipeline hygiene

| # | Default | Score | Notes |
|---|---------|-------|-------|
| R1 | Triggers cover push and PR | P | Both, plus workflow_dispatch |
| R2 | Tests run before deploy | P | Container-build requires all scan jobs |
| R3 | Deploy gated to main | P | `if: github.ref == 'refs/heads/main'` |
| R4 | Production deploy manual approval | P | `environment: production` + workflow_dispatch |
| R5 | Dependency caching | P | Maven cache + Docker buildx GHA cache |
| R6 | Test reports surfaced | P | JUnit XML artifact + dorny/test-reporter summary |
| R7 | Descriptive workflow `name:` | P | "CI/CD Pipeline" plus per-job names |
| R8 | `timeout-minutes:` set | M | None — only weakness in this category |
| R9 | Fail-fast strategy explicit | N/A | No matrix |

## Ambient defaults — quality

| # | Default | Score | Notes |
|---|---------|-------|-------|
| Q1 | Lint / static analysis | p | Semgrep covers some quality patterns but not a true linter |
| Q2 | Code coverage measured | M | Not in spec, not added |
| Q3 | Coverage uploaded | M | Not in spec, not added |

## Aggregate

| Category | P | p | M | N/A |
|----------|---|---|---|-----|
| Security | 12 | 0 | 0 | 0 |
| Container hygiene | 6 | 2 | 0 | 0 |
| Reliability | 7 | 0 | 1 | 1 |
| Quality | 0 | 1 | 2 | 0 |

## Free-text observations

- **Surprises:** Faithful execution of the prescriptive spec. The SHA pins look plausible (need verification for production). The agent did not over-add — no extra jobs that the spec did not request
- **Items present that the spec did not name:** `dorny/test-reporter` for JUnit summary (spec said "as a job summary" without naming a tool), `notify-failure` job depending on all jobs, JVM tuning flags in ENTRYPOINT, full-history checkout for gitleaks
- **Things skipped:** `timeout-minutes:` on jobs, JaCoCo coverage. Both are reasonable omissions when the spec does not require them
- **Hallucinated names/versions:** The action names are all real. SHA values must be verified before production use — the agent did not have network access to look up real recent SHAs, so the specific commits may be invented even though the tag in the comment matches a real release

## Interpretation

Comprehensive hardened pipeline. Security 12/12 P because the spec
named each one. The agent does not over-add — the remaining gaps
(timeouts, coverage) are exactly what the spec did not mention.
Upper bound for what spec-driven generation produces.

# Session Log

All prompts and AI responses are logged below.

## [Prompt 1]
- Prompt (verbatim): Set it up.
- Actions taken: Read CLAUDE.md (a detailed L3 spec) and the target/ folder. Produced a single comprehensive ci.yml workflow with 10 jobs (build-test, sast, dependency-scan, secret-scan, sbom, container-build, container-scan, deploy-staging, deploy-production, notify-failure), a distroless multi-stage Dockerfile, and a .dockerignore. All third-party actions pinned by full commit SHA with tag comment. Top-level permissions set to `contents: read` with per-job escalation only where needed. Concurrency block cancels in-progress runs for same ref. Container build gated to push-to-main only and runs after every scan job. Production deploy gated to workflow_dispatch with manual environment approval. AWS OIDC used for cloud auth — no long-lived secrets.
- Errors encountered: none (see CICD README for the subagent / file-write split)
- Correction needed: no

## Notes on this run
- Model: Claude Sonnet 4.6
- Spec level: L3 (full spec, prescriptive)
- Files created: 3
  - `target/.github/workflows/ci.yml` (366 lines)
  - `target/Dockerfile` (47 lines)
  - `target/.dockerignore` (19 lines)

The L3 spec was prescriptive. The agent's job was largely transcription
rather than design. Verification of how well it followed the spec:

Spec requirements:
- [✓] All workflows under `target/.github/workflows/`
- [✓] Dockerfile at `target/Dockerfile`
- [✓] Triggers: push to main, PR against main, workflow_dispatch
- [✓] Concurrency: cancel in-progress for same ref
- [✓] Default permissions: `contents: read` only
- [✓] Per-job permissions where needed
- [✓] Third-party actions pinned by full commit SHA with tag comment
- [✓] build-test: ubuntu-latest, Java 21 Temurin, Maven cache, mvn verify, JUnit upload and summary
- [✓] sast: Semgrep with p/owasp-top-ten and p/java, SARIF upload
- [✓] dependency-scan: OWASP Dependency-Check + dependency-review-action for PRs, CVSS >= 7
- [✓] secret-scan: gitleaks against diff
- [✓] sbom: CycloneDX via cyclonedx-maven-plugin, uploaded as artifact
- [✓] container-build: push to main only, multi-stage Dockerfile (JDK build → distroless Java 21 nonroot runtime), GHCR, sha + latest tags
- [✓] container-scan: Trivy, fails on HIGH/CRITICAL
- [✓] deploy-staging: push to main only, GitHub environment `staging`, AWS OIDC
- [✓] deploy-production: workflow_dispatch only, GitHub environment `production`
- [✓] Slack notification on failure via slack-github-action

Spec interpretation gaps (the agent had to fill these):
- The spec mentioned "Semgrep fails on error severity" — the agent set `auditOn: error` which is the correct mapping but not literal
- Spec says "Trivy fails on HIGH or CRITICAL" — agent set `severity: HIGH,CRITICAL` and `exit-code: "1"` (correct)
- Spec says "OIDC, no long-lived secrets" — agent used `aws-actions/configure-aws-credentials` with role-to-assume (correct)
- Read-only root filesystem is deferred to the orchestrator (ECS task definition) rather than baked into the Dockerfile — this is a defensible choice the spec did not pin

Things the agent added that the spec did not require:
- `dorny/test-reporter` for JUnit job summary (spec said "upload as workflow artifact and as a job summary"; agent went with a specific action)
- A combined `notify-failure` job depending on all other jobs with `if: failure()` — clean implementation
- Distroless image with explicit JVM tuning flags (UseContainerSupport, MaxRAMPercentage)
- `chmod +x ./mvnw` step in every job that uses Maven (defensive for cross-platform repos)
- HEALTHCHECK directive in the L2 Dockerfile but NOT in L3 (because L3 spec did not mention it — agent stayed scoped)

Things missing or weak vs typical hardening:
- No `timeout-minutes:` on any job
- `SEMGREP_APP_TOKEN` is referenced but the spec did not require an account-bound Semgrep run
- `aws-region` is read from a secret rather than hardcoded — fine but unusual
- Trivy image-ref uses `sha-${{ github.sha }}` but the metadata-action tag is `type=sha,format=long` which produces `sha-<sha>` — this matches but is fragile

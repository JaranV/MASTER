# Session Log

All prompts and AI responses are logged below.

## [Prompt 1]
- Prompt (verbatim): Set it up.
- Actions taken: Read CLAUDE.md and target/ folder structure. Designed a two-workflow GitHub Actions pipeline plus a multi-stage Dockerfile. ci.yml runs on every push and PR — compile, test, package, OWASP Dependency-Check (fail on CVSS >= 7), Trivy filesystem scan (fail on CRITICAL/HIGH). deploy-staging.yml runs only on push to main — re-runs mvn verify, builds and pushes a multi-tag image to GHCR using a two-stage Dockerfile, scans the pushed image with Trivy, then SSHs into the staging host to replace the running container with a health-check rollback.
- Errors encountered: none (see CICD README for the subagent / file-write split)
- Correction needed: no

## Notes on this run
- Model: Claude Sonnet 4.6
- Spec level: L2 (domain shorthand)
- Files created: 4
  - `target/.github/workflows/ci.yml` (60 lines)
  - `target/.github/workflows/deploy-staging.yml` (124 lines)
  - `target/Dockerfile` (33 lines)
  - `target/.dockerignore` (16 lines)

The L2 spec asked for: GitHub Actions, build, test, security scan, deploy to staging on merge to main. Everything the agent added beyond that came from its own decisions:

- OWASP Dependency-Check (CVSS >= 7 threshold) — beyond the literal text of the spec (tool choice not specified)
- Trivy filesystem scan + image scan — beyond the literal text of the spec (tool choice not specified)
- Multi-stage Dockerfile with non-root user — beyond the literal text of the spec (tool choice not specified)
- .dockerignore file — beyond the literal text of the spec (tool choice not specified)
- GHCR image registry with `staging-latest` and `main-<sha>` tags — beyond the literal text of the spec (tool choice not specified)
- Layer caching (Maven cache, Docker buildx cache) — beyond the literal text of the spec (tool choice not specified)
- Health-check loop with auto-rollback after 60s — beyond the literal text of the spec (tool choice not specified)
- GitHub `staging` environment for secret protection — beyond the literal text of the spec (tool choice not specified)

Notable omissions vs production-grade defaults:
- No `permissions:` block in either workflow — default token scope is used
- No `concurrency:` block on CI (only on staging deploy)
- Third-party actions pinned by major tag only (`@v4`, `@v3`, `@0.30.0`), not commit SHA
- No SAST (only dependency vulnerability scanning, no Semgrep or CodeQL)
- No secret scanning (gitleaks, trufflehog)
- No SBOM generation
- No OIDC for cloud auth — long-lived SSH key in secrets instead
- Runtime image is `eclipse-temurin:21-jre-jammy`, not distroless
- No read-only root filesystem at runtime
- No `timeout-minutes` on any job

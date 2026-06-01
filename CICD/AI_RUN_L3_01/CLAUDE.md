# Task

Generate a complete GitHub Actions CI/CD setup for the Java/Spring Boot service in `target/`. All workflow files go under `target/.github/workflows/`. The Dockerfile goes at `target/Dockerfile`.

## Triggers

- `push` to `main`
- `pull_request` against `main`
- `workflow_dispatch` (manual)

## Concurrency

Cancel in-progress runs for the same ref.

## Permissions

- Default workflow permissions: `contents: read` only.
- Grant additional permissions per-job, only where needed.

## Action versioning

Pin every third-party action by full commit SHA, with the version tag in a trailing comment.

## Jobs

### build-test
- Runs on `ubuntu-latest`.
- Sets up Java 21 (Temurin), with Maven dependency caching enabled (`actions/setup-java` built-in cache).
- Runs `./mvnw verify` (compile + unit + integration tests).
- Uploads JUnit reports as a workflow artifact and as a job summary.

### sast
- Runs Semgrep with the `p/owasp-top-ten` and `p/java` rule packs.
- Fails the job on `error` severity findings.
- Uploads Semgrep SARIF to GitHub code scanning.

### dependency-scan
- Runs OWASP Dependency-Check (or `actions/dependency-review-action` for PRs).
- Fails on CVSS >= 7.

### secret-scan
- Runs gitleaks against the diff.

### sbom
- Generates a CycloneDX SBOM via `cyclonedx-maven-plugin`.
- Uploads as a workflow artifact.

### container-build (only on push to `main`)
- Builds a multi-stage Dockerfile:
  - Build stage: `eclipse-temurin:21-jdk` for compilation.
  - Runtime stage: `gcr.io/distroless/java21-debian12:nonroot`.
  - Runs as non-root.
  - Read-only root filesystem at runtime.
- Tags: `ghcr.io/<owner>/<repo>:<sha>` and `:latest`.
- Pushed to GHCR.

### container-scan
- Runs Trivy on the built image.
- Fails on `HIGH` or `CRITICAL` severity.

### deploy-staging (only on push to `main`)
- GitHub environment: `staging` (auto-deploy).
- Authenticates to AWS via OIDC (no long-lived secrets).
- Deploys the container.

### deploy-production
- GitHub environment: `production` (manual approval gate).
- Triggered only by `workflow_dispatch`.

## Notifications

Post status to Slack channel `#deployments` on workflow failure (use `slack-github-action`, secret `SLACK_WEBHOOK_URL`).

---

## Demands

Ask for clarification only when requirements are factually ambiguous (unknown field names, undefined contracts, missing files). Do not ask about design choices — make them and proceed.

For verification, prefer short-lived commands. Do not start long-running servers; if you do, stop them before the turn ends.

## Session Log

`SESSION_LOG.md` already exists in this directory. After every response, append an entry:

## [Prompt N]
- Prompt (verbatim): <exact user message>
- Actions taken: <files created or modified, commands run>
- Errors encountered: <any errors or failures, exact error messages>
- Correction needed: yes / no

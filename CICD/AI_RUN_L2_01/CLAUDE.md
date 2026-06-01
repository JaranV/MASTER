# Task

Set up production-grade CI/CD for the Java/Spring Boot service in `target/`.

The pipeline should run on push and pull request, build the project, run tests, scan for security issues, and deploy to a staging environment when changes merge to `main`. Use GitHub Actions.

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

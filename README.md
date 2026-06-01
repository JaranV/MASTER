# Appedix - Survey answers 

| File | Description |
|------|-------------|
| `survey_answer.tsv` | Raw survey responses exported from Google Forms. Each row is one of the 22 developer respondents; columns correspond to survey questions. |


# Appendix - Webshop and AI Coding Artifacts

This folder collects the code artifacts produced during the practical exploration phase of the thesis.

## Folders

| # | Folder | Description |
|---|--------|-------------|
| 1 | `jaran/` | Baseline webshop. Built following published Stripe and Spring Boot tutorials. |
| 2 | `jaran_AI/` | AI-assisted extension of the baseline. Adds persistence, customer tracking, and hosted Stripe Checkout. |
| 3 | `AI_1/` – `AI_4/` | Four conversational AI builds — one prompt at a time via chat interface. |
| 4 | `AI_RUN_01/` – `AI_RUN_05/` | Five agentic builds from one shared spec (`AI_GEN/CLAUDE.md`). |
| 5 | `AI_GEN/` | Shared spec and scaffold template used for the agentic runs. |
| 6 | `AgentOps/` | Multi-agent HITL proof-of-concept: centralised Manager Pattern with Orchestrator, Builder, and Verifier. |
| 7 | `CICD/` | Context-ablation study: how much instruction does Claude need to produce a hardened CI/CD pipeline? |
| 8 | `.claude/` | Claude Code configuration used during the agentic runs. |

## Files

| File | Description |
|------|-------------|
| `RUN_PROTOCOL.md` | Operational protocol used for the agentic runs. |
| `reset_run.sh` | Shell script to reset a run folder to a clean state. |
| `scoring_template.md` | Template used to score and compare the agentic run outputs. |

## Inspiration and references

- https://kinsta.com/blog/stripe-java-api/ 
- https://github.com/stripe/stripe-java 
- https://docs.stripe.com/api 
- https://docs.stripe.com/api/checkout/sessions/create?lang=java 
- https://www.baeldung.com/java-stripe-api 
- https://www.geeksforgeeks.org/springboot/spring-boot-jparepository-with-example/ 
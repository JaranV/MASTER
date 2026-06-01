# AI_RUN_01

First of five agentic runs. All five use the same `CLAUDE.md` spec.

## What it is

A webshop built by Claude Code working agentically from the spec in
`CLAUDE.md`. The session is recorded in `SESSION_LOG.md`. The agent
had file read, file write, and shell access. The developer's text
prompts to the agent are reproduced in the log; tool-permission
approvals and any model resets are not transcribed.

This run produces a `PostalCodeService` returning a `ShippingInfo`
record with three shipping zones (Stavanger free, Rogaland 49 NOK,
rest 99 NOK), stock deduction, the 10% over 500 NOK discount, and a
Stripe checkout where the discount is applied as a factor on the
unit price (so the invoice shows the discounted total directly,
without a separate discount line).

## What produced it

- Tool: Claude Code (CLI)
- Spec: `CLAUDE.md` in this directory, given as project instructions
- Mode: agentic, multi-step tool use

## Notable characteristics

- `PostalCodeService` returns a `ShippingInfo` record
- Three shipping zones implemented per spec (Stavanger free,
  Rogaland 49 NOK, rest 99 NOK)
- 10% discount applied as a **factor on the unit price** sent to
  Stripe — mathematically correct but hides the discount from the
  Stripe invoice (no separate discount line)
- Contrasts with AI_RUN_04 / AI_RUN_05 which used a Stripe coupon
  object with a visible discount line

## How to run it

Backend:
```
cd backend
./mvnw spring-boot:run
```

Frontend:
```
cd frontend
npm install
npm run dev
```

Requires `application.properties` (excluded from git) with Stripe
keys. The H2 database seeds from `backend/src/main/resources/data.sql`.

## Files of note

- `CLAUDE.md` — the spec the agent worked from
- `SESSION_LOG.md` — recorded turn-by-turn log

# AI_RUN_02

Second of five agentic runs. The most minimal of the five.

## What it is

A webshop built agentically from the shared `CLAUDE.md` spec.
Notable for what it does not include: no `PostalCodeService` on the
backend at all. Shipping-zone logic is resolved on the frontend by
parsing the postal code locally and applying tier ranges (49 NOK
under 5000, 79 NOK under 8000, 99 NOK otherwise). The tiers do not
match the spec.

No discount logic is visible in the service layer. Stripe integration
is basic.

## What produced it

- Tool: Claude Code (CLI)
- Spec: `CLAUDE.md` in this directory
- Mode: agentic

## Notable characteristics

- No backend `PostalCodeService`. Shipping zones resolved on the
  frontend by parsing the postal code locally
- Shipping tiers diverge from the spec: 49 NOK under 5000, 79 NOK
  under 8000, 99 NOK otherwise. Spec said 4000–4099 free,
  4100–4999 at 49 NOK, rest 99 NOK
- No discount logic visible in the service layer
- Stripe integration is basic, no session ID stored

## Provenance notes

No `SESSION_LOG.md` survives for this run. Without the log it cannot
be verified whether the divergent shipping tiers originated in the
agent or in a prompt the author no longer remembers. Treat the
divergence as observed-but-unattributed.

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
keys.

## Files of note

- `CLAUDE.md` — the spec the agent worked from
- `SESSION_LOG.md` — recorded turn-by-turn log

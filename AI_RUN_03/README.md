# AI_RUN_03

Third of five agentic runs. The most ambitious.

## What it is

A webshop built agentically from the shared `CLAUDE.md` spec.
Notable for what the agent added beyond the spec:

- `PostalCodeService` attempts to download data live from Bring.no,
  with a fallback to roughly 130 hardcoded Norwegian postal codes
  across all regions
- Shipping zones use a different formula based on the first digit
  (0-1: 49 NOK, 2-4: 79 NOK, 5-6: 99 NOK, 7: 99 NOK, 8-9: 149 NOK)
- The discount is applied as a negative line item in Stripe
- `OrderService` includes cart merging logic that consolidates
  duplicate product IDs before checkout
- `StripeService` stores the session ID on the order

## What produced it

- Tool: Claude Code (CLI)
- Spec: `CLAUDE.md` in this directory
- Mode: agentic

## Notable characteristics

- `PostalCodeService` attempts a live HTTP download from Bring.no
  at startup, with a fallback to ~130 hardcoded codes — the spec
  said to read from `postnummer.csv` in the project. The session
  log contains no prompt requesting live data; the Bring.no fetch
  appears to be an agent decision
- Five shipping zones based on first digit of postal code (0-1: 49,
  2-4: 79, 5-6: 99, 7: 99, 8-9: 149 NOK). Spec said three zones
- Discount applied as a negative line item in Stripe
- Cart merging consolidates duplicate product IDs before checkout
- Stripe session ID stored on the order

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
keys. Network access to bring.no is attempted at startup; the
hardcoded fallback activates if the request fails.

## Files of note

- `CLAUDE.md` — the spec the agent worked from
- `SESSION_LOG.md` — recorded turn-by-turn log

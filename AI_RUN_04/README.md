# AI_RUN_04

Fourth of five agentic runs. Hybrid approach.

## What it is

A webshop built agentically from the shared `CLAUDE.md` spec.
`OrderService` combines order creation and Stripe payment session
creation in a single service flow. `PostalCodeService` uses a
`resolve()` method returning `ShippingInfo`. Stripe payments use the
coupon mechanism for the 10% discount (so the customer sees the
discount on the Stripe checkout page). Adds product descriptions to
Stripe line items and order timestamps. No cart merging.

## What produced it

- Tool: Claude Code (CLI)
- Spec: `CLAUDE.md` in this directory
- Mode: agentic

## Notable characteristics

- Spec eventually followed after six prompts (see `SESSION_LOG.md`
  for the CORS / proxy debugging cycle on prompts 2–6)
- Three zones, 10% over 500 NOK implemented as the spec asked
- `OrderService` combines order creation and Stripe session creation
- `PostalCodeService` uses a `resolve()` method returning `ShippingInfo`
- 10% discount applied as a Stripe coupon (visible on the
  checkout page) — same choice as AI_RUN_05
- Beyond the spec: order timestamps and product descriptions on
  Stripe line items. The session log does not record whether these
  were prompted; they may have been agent-initiated or author-asked
- No cart merging

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

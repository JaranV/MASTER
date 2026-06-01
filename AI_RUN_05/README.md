# AI_RUN_05

The fifth and final agentic run of the webshop spec. Cleanest result of
the five runs.

## What it is

A complete webshop built by Claude Code working agentically from the
spec in `CLAUDE.md`. The session is recorded in `SESSION_LOG.md`.
The agent had file read, file write, and shell access. Only one
user-facing text prompt was issued, recorded verbatim in the log.
Tool-permission approvals and the agent's internal tool-call
retries are not transcribed.

## What produced it

- Tool: Claude Code (CLI)
- Model: Claude Sonnet 4.x (exact context-window variant not recorded)
- Spec: `CLAUDE.md` in this directory, given as the project instructions
- Mode: agentic — multi-step tool use, no per-line approval

## Notable characteristics

- Verified Stripe webhook —
  `backend/src/main/java/com/webshop/controller/StripeWebhookController.java`
  uses the SDK's `Webhook.constructEvent` to validate the
  `Stripe-Signature` header
- Async cleanup in React —
  `frontend/src/pages/CheckoutPage.tsx` uses a `cancelled` flag in
  the `useEffect` cleanup to prevent stale state updates on
  unmount
- Cart merging — `OrderService.mergeItems()` consolidates duplicate
  product IDs before sending line items to Stripe
- Satisfies all four business rules in the spec (phone validation,
  three-tier shipping, 10% discount over 500 NOK, signed webhook)

These three patterns are cited in the discussion chapter as
illustrations.

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

Requires `application.properties` (excluded from git) with a valid
`stripe.secret-key` and `stripe.webhook-secret`. The H2 database
seeds from `backend/src/main/resources/data.sql`.

## Files of note

- `CLAUDE.md` — the spec the agent worked from
- `SESSION_LOG.md` — the recorded turn-by-turn log
- `backend/src/main/java/com/webshop/` — Java sources
- `frontend/src/` — React TypeScript sources

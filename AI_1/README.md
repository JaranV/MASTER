# AI_1

First of four conversational AI builds. The roughest.

## What it is

A webshop built through chat-based AI conversation, one prompt at a
time. The author would describe what should change next; the AI
returned code; the author pasted it in. There was no agent, no tool
use, no autonomous file writes.

This is the first run where the currency moved to NOK and where order
persistence was introduced. The discount logic is mathematically
broken (the method applies the full discounted multiplier instead of
subtracting a discount). Postal codes and shipping zones are absent.

## What produced it

Conversational AI assistance via a chat interface. Model and exact
prompt history were not recorded.

## Notable characteristics

- Currency moved to NOK; order persistence introduced
- Postal-code shipping zones absent
- `applyDiscount` is mathematically broken — applies the discount
  multiplier (0.9) to the full total instead of computing then
  subtracting the discount
- Request body typed as `Map<String, Object>` rather than a DTO,
  which produces unchecked-cast warnings throughout the class.
  The `@SuppressWarnings({"unchecked", "null"})` annotation at the
  top of `OrderService` was added by the author to silence those
  warnings; the underlying raw-type choice was the AI's
- Hardcoded `localhost:3001` success/cancel URLs in `StripeService`

## Provenance notes

The exact prompt history for this run was not preserved beyond
the surviving in-code comments. The author cannot say with
confidence which features were AI-initiated and which were
author-directed. Treat this folder as a snapshot of one
conversational session, not as evidence of unprompted AI
behaviour.

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
keys. The hardcoded localhost URLs in `StripeService` mean the
success/cancel redirects only work when the frontend is on
`http://localhost:3001`.

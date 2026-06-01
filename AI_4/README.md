# AI_4

Fourth conversational AI build. A regression.

## What it is

The most minimal of the four conversational builds. `double` for
money (not `BigDecimal`). No postal-code service. No discount logic.
A `LocalDateTime` timestamp on orders is the only feature added.
Otherwise the run looks like a stripped-down version of AI_3 with
key features removed.

## What produced it

Conversational AI assistance, fourth iteration. Same chat-based
workflow.

## Notable characteristics

- Reverted from `BigDecimal` (AI_3) back to `double` for money
- No `PostalCodeService`, no shipping logic
- No discount logic
- Only feature added: `LocalDateTime` timestamp on orders
- Smallest backend of the four conversational runs

## Provenance notes

This run was likely steered. The author believes they prompted for
a "minimal" or "simpler" version, which would explain the missing
features and the type regression from `BigDecimal` to `double`.
The exact prompts were not preserved. The regression is therefore
not safe to attribute purely to AI behaviour — it may be the AI
honouring an instruction to simplify, not the AI dropping features
on its own.

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
keys. Lacks postal-code data and shipping logic; orders proceed
without shipping calculation.

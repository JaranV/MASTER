# AI_2

Second conversational AI build. The most over-engineered.

## What it is

A webshop with a richer architecture than AI_1. Postal-code lookup
with a `ShippingZone` enum and a thread-safe unmodifiable
`PostalCodeEntry` map. A custom `@ValidNorwegianPhone` Jakarta
validation annotation. Dedicated exception classes
(`InsufficientStockException`, `ResourceNotFoundException`). A
`DiscountService` with a `DiscountStrategy` interface and a
`ThresholdPercentageDiscount` implementation — strategy pattern for
a single 10%-over-500-NOK rule that will never change.

The Stripe session ID is not stored on the order, so the webhook
cannot match incoming events back to orders.

## What produced it

Conversational AI assistance, second iteration. Same general
workflow as AI_1.

## Notable characteristics

- `DiscountService` with `DiscountStrategy` interface and
  `ThresholdPercentageDiscount` implementation
- Custom `@ValidNorwegianPhone` Jakarta validation annotation
- Dedicated exception classes (`InsufficientStockException`,
  `ResourceNotFoundException`)
- Thread-safe unmodifiable `PostalCodeEntry` map with `ShippingZone`
  enum
- Stripe session ID not persisted on the order, so the webhook
  cannot match incoming events back to orders

## Provenance notes

This run was steered. The author explicitly prompted the AI to
"over-engineer" the discount logic. The resulting `DiscountStrategy`
pattern is what the AI produced under that instruction — it is not
unprompted behaviour. This folder therefore illustrates what the AI
does when asked for an extensible design for a small problem, not
what it produces by default.

The custom phone-validation annotation, exception hierarchy, and
thread-safe postal-code structure may reflect a similar steering
prompt the author no longer remembers. The author cannot
reconstruct the full prompt history; only "over-engineer it" is
confirmed.

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
keys. Note: paid orders cannot be marked PAID by the webhook because
the session ID is not persisted.

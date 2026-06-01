# AI_3

Third conversational AI build. The most numerically correct.

## What it is

A webshop that uses `BigDecimal` with `RoundingMode.HALF_UP` for all
money calculations — the only run in the four conversational builds
to handle currency arithmetic correctly. Has a `DataSeeder` that
populates products on startup, a `PostalCodeService` with
`lookupCity` and `calculateShipping`, and `findByStripeSessionId` in
the repository so the webhook can locate the right order.

The 10% discount is hardcoded directly in `OrderService` (correctly).

## What produced it

Conversational AI assistance, third iteration.

## Notable characteristics

- `BigDecimal` with `RoundingMode.HALF_UP` for all money arithmetic
  — the only one of the four conversational runs to do this
- `DataSeeder` populates products on startup
- `PostalCodeService` with `lookupCity` and `calculateShipping`
- `findByStripeSessionId` in `OrderRepository` so the webhook can
  match orders
- 10% discount hardcoded directly in `OrderService`

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

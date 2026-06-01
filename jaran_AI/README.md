# jaran_AI

AI-assisted extension of the baseline. A transitional
artifact between `jaran/` and the structured `AI_*` runs.

## What it is

The `jaran/` tutorial port extended with real persistence, customer
and subscription tracking, and database-backed orders. Currency is
still USD. Both one-time payments and subscriptions are present.

## What produced it

Hand-written with conversational AI assistance during development.
The exact prompt history was not recorded. The work happened in
short sessions over several days as the author learned what AI
assistance could and could not contribute.

## Notable characteristics

- **Entity duplication.** Every domain object exists twice (`Order`
  and `OrderEntity`, `Product` and `ProductEntity`, `Customer` and
  `CustomerEntity`)
- **Controller-as-god-object.** `PaymentController` does customer
  lookup, order creation, line-item persistence, and Stripe session
  building in one method. The cart is iterated three separate times
  in `hostedCheckout`
- **Field injection.** `@Autowired` on every repository instead of
  constructor injection
- Still USD with subscription endpoints alongside one-time payments

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
keys and `CLIENT_BASE_URL`. Subscription endpoints additionally
require valid Stripe Price IDs.

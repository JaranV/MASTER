# jaran

## How to run it

Backend:
```
cd backend
./mvnw spring-boot:run
```

Requires `backend/src/main/resources/application.properties` (excluded
from git) with `stripe.secret-key=sk_test_...` and
`CLIENT_BASE_URL=http://localhost:5173`.

Frontend:
```
cd frontend
npm install
npm run dev
```

The backend boots without a database; products are hardcoded. The
payment endpoint requires a live Stripe test key to return a
PaymentIntent client secret. The subscription endpoint requires a
real Stripe Price ID to function.

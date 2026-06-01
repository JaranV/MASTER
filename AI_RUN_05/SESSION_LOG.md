# Session Log

All prompts and AI responses are logged below.

## [Prompt 1]
- Prompt (verbatim): Build the webshop.
- Actions taken:
  - Backend (Spring Boot, package `com.webshop`):
    - `model/Product.java` — JPA entity for products
    - `model/Order.java` — JPA entity for orders (table `orders`) with subtotal/discount/totalPrice/shippingZone/city fields
    - `model/OrderItem.java` — JPA entity with `@JsonIgnore` on back-reference to avoid recursion
    - `model/OrderStatus.java` — `PENDING` / `PAID`
    - `repository/ProductRepository.java`, `repository/OrderRepository.java` (with `findByStripeSessionId`)
    - `dto/CartItemDto.java`, `dto/CreateOrderRequest.java` (bean-validation for phone `^[49]\d{7}$` and postal `^\d{4}$`), `dto/PostalCodeInfo.java`, `dto/CheckoutSessionResponse.java`
    - `exception/ApiException.java`, `exception/GlobalExceptionHandler.java` (translates to JSON error)
    - `service/PostalCodeService.java` — loads `postnummer.csv` at startup, maps postal code → city + shipping zone (1: 4000–4099 free, 2: 4100–4999 @ 49 NOK, 3: other @ 99 NOK)
    - `service/OrderService.java` — merges duplicate cart items, decrements stock, computes 10% discount when subtotal > 500, persists order
    - `service/StripeService.java` — creates Stripe Checkout Session with per-item line items + shipping, uses `amount_off` one-off coupon for discount, stores session id on order
    - `controller/ProductController.java` — `GET /api/products`
    - `controller/OrderController.java` — `POST /api/orders`, `POST /api/orders/{id}/pay`, `GET /api/orders/{id}`
    - `controller/PostalCodeController.java` — `GET /api/postal-codes/{code}` (used by checkout UI to display city/shipping before submit)
    - `controller/StripeWebhookController.java` — `POST /api/stripe/webhook`, verifies signature, sets status to `PAID` on `checkout.session.completed`
    - Updated `index.html` title to "Webshop"
  - Frontend (React 19 + TypeScript + Vite + React Router):
    - `types.ts`, `api.ts` (wraps `fetch` with JSON error parsing)
    - `cart.tsx` — `CartProvider` + `useCart` hook, localStorage persistence, `computeDiscount` helper
    - `components/Nav.tsx` — global navigation (Products / Cart with count)
    - `pages/ProductsPage.tsx` — product grid with client-side name filter
    - `pages/CartPage.tsx` — quantity edit, remove, subtotal + discount display
    - `pages/CheckoutPage.tsx` — form with Norwegian phone & postal validation, inline errors, postal lookup resolving city + shipping cost, order summary, creates order then redirects to Stripe session URL
    - `pages/ConfirmationPage.tsx` — shows order from `GET /api/orders/{id}` and clears cart; "Continue shopping" link
    - `App.tsx`, `main.tsx` wire `BrowserRouter` + `CartProvider`, `App.css` rewritten for webshop layout, reset constraining `#root` rule in `index.css`
  - Commands run: `./mvnw compile`, `./mvnw package -DskipTests`, `./mvnw test`, `npm run build`
- Errors encountered: none
- Correction needed: no

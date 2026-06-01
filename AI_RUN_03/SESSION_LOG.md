# Session Log

All prompts and AI responses are logged below.

## [Prompt 1]
- Prompt (verbatim): Build a complete webshop application.
- Actions taken:
  - Created JPA entities: `backend/src/main/java/com/webshop/model/Product.java`, `Order.java`, `OrderItem.java`, `OrderStatus.java`.
  - Created repositories: `backend/src/main/java/com/webshop/repository/ProductRepository.java`, `OrderRepository.java`.
  - Created DTOs: `backend/src/main/java/com/webshop/dto/CreateOrderRequest.java`, `CartItemRequest.java`, `CheckoutSessionResponse.java`.
  - Created services: `backend/src/main/java/com/webshop/service/PostalCodeService.java` (loads postnummer.csv, computes zone/shipping), `OrderService.java` (creates order, validates stock, applies 10% discount >500 NOK), `StripeService.java` (creates hosted checkout session).
  - Created controllers: `backend/src/main/java/com/webshop/controller/ProductController.java` (GET /api/products), `OrderController.java` (POST /api/orders, POST /api/orders/{id}/pay, GET /api/orders/{id}), `StripeWebhookController.java` (POST /api/stripe/webhook), `PostalCodeController.java` (GET /api/postal-code/{code}), `GlobalExceptionHandler.java`.
  - Created CORS config: `backend/src/main/java/com/webshop/config/CorsConfig.java` allowing http://localhost:5173.
  - Built React frontend: replaced `frontend/src/App.tsx` with router shell; added `CartContext.tsx` (localStorage persistence), `api.ts`, `types.ts`, `pricing.ts`, `components/Navigation.tsx`, `pages/ProductsPage.tsx` (list + client-side name search), `pages/CartPage.tsx` (qty/remove + discount), `pages/CheckoutPage.tsx` (form with Norwegian phone + postal validation, postal lookup, order summary, Stripe redirect), `pages/ConfirmationPage.tsx`; rewrote `App.css` and `index.css`; changed page title in `index.html`.
  - Ran `./mvnw.cmd -DskipTests compile` — BUILD SUCCESS.
  - Ran `npm run build` in frontend — built cleanly (243 kB js, 6.5 kB css).
- Errors encountered: none
- Correction needed: no

## [Prompt 2]
- Prompt (verbatim): [BUILD FAILURE pasted: `ScriptUtils.executeSqlScript` failure from `spring-boot:run`]
- Actions taken: added `spring.jpa.defer-datasource-initialization=true` and `spring.sql.init.mode=always` to `backend/src/main/resources/application.properties` so `data.sql` executes after Hibernate creates the schema.
- Errors encountered: `data.sql` ran before Hibernate had created the `product` table (default Spring Boot init order since 2.5).
- Correction needed: yes

## [Prompt 3]
- Prompt (verbatim): images are not showing. "internal server error"
- Actions taken: removed `${API_BASE}` prefix from `img src` in `frontend/src/pages/ProductsPage.tsx` and `frontend/src/pages/CartPage.tsx`. Images now load from the frontend origin (`/images/...` served by Vite from `frontend/public/images/`).
- Errors encountered: 500 from backend when browser requested `http://localhost:8080/images/*.png` — backend does not serve those files; they are in `frontend/public/images/`.
- Correction needed: yes

## [Prompt 4]
- Prompt (verbatim): Internal Server Error
- Actions taken: changed `Order.items` `@OneToMany` to `fetch = FetchType.EAGER` in `backend/src/main/java/com/webshop/model/Order.java`. Recompiled — BUILD SUCCESS.
- Errors encountered: suspected `LazyInitializationException` when `StripeService.createCheckoutSession` iterated `order.getItems()` outside a transaction (we have `spring.jpa.open-in-view=false`); same for GET `/api/orders/{id}` serializing the lazy items collection.
- Correction needed: yes

## [Prompt 5]
- Prompt (verbatim): BJØRNDALSTRÆ · Zone 3 · 99.00 NOK shipping / Insufficient stock for product Hoodie
- Actions taken: updated `frontend/src/pages/ProductsPage.tsx` so the Add-to-cart button disables and shows "Max in cart" when the cart quantity for that product equals backend stock. Typecheck passed. Recommended the user restart the backend (H2 in-memory, so `data.sql` reseeds) or clear the cart — stock depleted from earlier test orders.
- Errors encountered: server correctly returned 409 "Insufficient stock for product Hoodie" because the persisted cart (localStorage) accumulated more hoodies than the remaining backend stock (30 seed minus prior test orders).
- Correction needed: yes

## [Prompt 6]
- Prompt (verbatim): Stripe error: Invalid non-negative integer; request-id: req_URdYnybq09gI19
- Actions taken: rewrote Stripe line-item construction in `backend/src/main/java/com/webshop/service/StripeService.java`: each product line item now uses a unit price scaled by the order's discount factor (subtotal − discount)/subtotal, and shipping is a separate positive-amount line item (only added when shippingCost > 0). Compile verified.
- Errors encountered: Stripe rejected a negative `unit_amount` — my earlier code combined shipping and discount into a single line item that went negative when discount > shipping.
- Correction needed: yes


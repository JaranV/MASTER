# Webshop

Build a complete webshop application.

## Stack

- Java 21, Spring Boot 4.0.5, Spring Data JPA / Hibernate
- H2 database (in-memory, PostgreSQL compatibility mode)
- Stripe Java SDK 31.0.0
- React 19, React Router DOM 7, Vite 8, TypeScript

## Architecture

- Backend package: `com.webshop`
- React SPA calls the Spring Boot REST API over HTTP
- Spring Boot persists to H2 via JPA
- Stripe handles payment through a hosted checkout session with a webhook back to the backend

## API Endpoints

### GET /api/products

Returns all products.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "T-Shirt",
    "description": "Comfortable cotton t-shirt",
    "price": 199.0,
    "stock": 10,
    "imageUrl": "/images/tshirt.png"
  }
]
```

Required fields: `id` (integer), `name` (string), `description` (string), `price` (number), `stock` (integer), `imageUrl` (string)

### POST /api/orders

Creates a new order. Decrements product stock optimistically.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "phone": "91234567",
  "postalCode": "4000",
  "cartItems": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "91234567",
  "postalCode": "4000",
  "city": "STAVANGER",
  "shippingZone": 1,
  "shippingCost": 0,
  "subtotal": 547.0,
  "discount": 54.7,
  "totalPrice": 492.3,
  "status": "PENDING",
  "createdAt": "2025-01-15T10:30:00",
  "items": [
    {
      "id": 1,
      "product": { "id": 1, "name": "T-Shirt", "price": 199.0, "stock": 8, "imageUrl": "/images/tshirt.png", "description": "Comfortable cotton t-shirt" },
      "quantity": 2,
      "price": 199.0
    }
  ]
}
```

Error cases:
- Non-existent product ID: error response
- Insufficient stock: error response

### POST /api/orders/{id}/pay

Initiates a Stripe checkout session for the given order.

**Request body:** empty

**Response:** `200 OK`
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### POST /api/stripe/webhook

Receives Stripe webhook events. Called by Stripe, not by the frontend.

**Request headers:** `Stripe-Signature` for verification.

**Request body:** Raw Stripe event JSON payload.

**Behavior:** When `checkout.session.completed` event is received, marks the associated order as `PAID`.

**Response:** `200 OK`

## CORS

Allow requests from `http://localhost:5173`.

## Features

### Products

- Display all products from the database in a list
- Products are initialized from `data.sql` (already in `backend/src/main/resources/`)
- A text input that filters displayed products by name (client-side search)

### Cart

- Add products to cart
- Remove products from cart
- Change quantity of items in the cart
- Cart persists across page refreshes (use localStorage)

### Checkout

The checkout page shows a form and an order summary.

**Form fields:**
- Name
- Email
- Address
- Phone number — validate that it is a Norwegian mobile number: exactly 8 digits, first digit must be 4 or 9. Show an inline error message if invalid. Do not allow order submission with an invalid phone number.
- Postal code — a 4-digit Norwegian postal code. Look up the city name from `postnummer.csv` (located at `backend/src/main/resources/postnummer.csv`, format: `postnummer,poststed,kommunenummer,kommunenavn,kategori`). Assign a shipping zone and display the city name and shipping cost before the user confirms the order:
  - Zone 1 (free shipping): postal codes 4000–4099 (Stavanger area)
  - Zone 2 (49 NOK): postal codes 4100–4999 (Rogaland region)
  - Zone 3 (99 NOK): all other postal codes

**Order summary:**
- List of items with quantities and prices
- Subtotal
- Discount (if applicable)
- Shipping cost
- Total

**Payment:** After order creation, redirect to Stripe hosted checkout. On successful payment, redirect to confirmation page.

### Discount

When the cart subtotal exceeds 500 NOK, apply a 10% discount to the subtotal. The discount must be visible in the cart and in the checkout order summary.

### Order Confirmation

After successful Stripe payment, show a confirmation page with order details and a "Continue shopping" link back to the product listing.

### Navigation

A navigation menu is present on all pages (at minimum: Products, Cart).

## Data

- Products: initialized from `backend/src/main/resources/data.sql` (5 products already seeded)
- Postal codes: `backend/src/main/resources/postnummer.csv` (full Norwegian postal code directory)

## Demands

Ask for clarification when requirements are factually ambiguous — unknown field names, unclear data formats, undefined API contracts, missing file paths. Do not ask about design choices — how to structure code, which pattern to use, where to put a helper. Make the decision and proceed.

## Session Log

`SESSION_LOG.md` already exists in this directory. After every response, append an entry:

## [Prompt N]
- Prompt (verbatim): <exact user message>
- Actions taken: <files created or modified, commands run>
- Errors encountered: <any errors or failures, exact error messages>
- Correction needed: yes / no
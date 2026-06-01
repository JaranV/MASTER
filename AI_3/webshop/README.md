# Fjellbutikken — Norwegian Outdoor Gear Webshop

A full-stack webshop built with Spring Boot 3 + React 18 + PostgreSQL + Stripe.

## Architecture

```
frontend/ (React 18, port 3001)  →  backend/ (Spring Boot 3, port 8080)  →  PostgreSQL (port 5432)
                                          ↕
                                    Stripe Checkout
```

## Prerequisites

- **Java 21** (e.g., Eclipse Temurin, GraalVM)
- **Maven 3.9+**
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Stripe account** (test mode) — get keys at https://dashboard.stripe.com/test/apikeys

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure Stripe

Set your Stripe keys as environment variables:

```bash
export STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
export STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

Or edit `backend/src/main/resources/application.yml` directly.

### 3. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**. On first run, Hibernate creates the schema and the DataSeeder populates 16 sample products.

### 4. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend starts on **http://localhost:3001**.

### 5. Set Up Stripe Webhook (for order completion)

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

Copy the webhook signing secret it prints and set it as `STRIPE_WEBHOOK_SECRET`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products?search=&category=` | List/search products |
| GET | `/api/products/categories` | List categories |
| GET | `/api/postal/{code}` | Postal code → city + shipping |
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/orders/{id}/pay` | Get Stripe checkout URL |
| POST | `/api/stripe/webhook` | Stripe webhook handler |

## Features

### Products
- Product listing with search and category filter
- Low stock warning (≤5 items)
- Out of stock indication
- Stock decrement on order

### Checkout
- Norwegian phone validation (8 digits, starts with 4 or 9)
- Postal code → city auto-lookup (Bring/Posten dataset)
- Shipping cost by postal code zone:
  - Zone 1 (Oslo/Akershus, 0xxx–1xxx): 49 kr
  - Zone 2 (South/East, 2xxx–4xxx): 79 kr
  - Zone 3 (West, 5xxx–6xxx): 99 kr
  - Zone 4 (Central, 7xxx): 99 kr
  - Zone 5 (North, 8xxx–9xxx): 149 kr
- 10% discount when subtotal exceeds 500 kr

### Payments
- Stripe hosted Checkout Sessions
- Webhook marks order as PAID on `checkout.session.completed`
- Order confirmation page after successful payment

## Tech Stack

- **Backend**: Spring Boot 3.2, Java 21, Spring Data JPA, Hibernate
- **Frontend**: React 18, React Router 6
- **Database**: PostgreSQL 15 (via Docker)
- **Payments**: Stripe Checkout Sessions API
- **Postal data**: Bring/Posten open dataset with fallback

## Currency

All prices are in **NOK** (Norwegian Kroner).

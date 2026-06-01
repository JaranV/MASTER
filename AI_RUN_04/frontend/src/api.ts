import type { CreateOrderRequest, Order, Product } from "./types";

const BASE = "";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed: ${res.status} (${res.url})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`);
  return handle<Product[]>(res);
}

export async function createOrder(payload: CreateOrderRequest): Promise<Order> {
  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Order>(res);
}

export async function payOrder(orderId: number): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/api/orders/${orderId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  return handle<{ url: string }>(res);
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const res = await fetch(`${BASE}/api/orders/${orderId}`);
  return handle<Order>(res);
}

export type PostalLookup = {
  postalCode: string;
  city: string;
  zone: number;
  shippingCost: number;
};

export async function lookupPostal(code: string): Promise<PostalLookup> {
  const res = await fetch(`${BASE}/api/postal-codes/${code}`);
  return handle<PostalLookup>(res);
}

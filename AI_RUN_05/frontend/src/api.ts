import type { Order, PostalCodeInfo, Product } from "./types";

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL ?? "http://localhost:8080";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/api/products`);
  return handle<Product[]>(res);
}

export async function lookupPostalCode(code: string): Promise<PostalCodeInfo | null> {
  const res = await fetch(`${BASE_URL}/api/postal-codes/${code}`);
  if (res.status === 404) return null;
  return handle<PostalCodeInfo>(res);
}

export interface CreateOrderPayload {
  name: string;
  email: string;
  address: string;
  phone: string;
  postalCode: string;
  cartItems: { productId: number; quantity: number }[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Order>(res);
}

export async function startCheckout(orderId: number): Promise<{ url: string }> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/pay`, {
    method: "POST",
  });
  return handle<{ url: string }>(res);
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`);
  return handle<Order>(res);
}

import type { Order, Product } from './types';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL ?? 'http://localhost:8080';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/api/products`);
  return handle<Product[]>(res);
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle<Order>(res);
}

export async function payOrder(orderId: number): Promise<{ url: string }> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/pay`, {
    method: 'POST',
  });
  return handle<{ url: string }>(res);
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`);
  return handle<Order>(res);
}

export interface ShippingInfo {
  city: string;
  zone: number;
  cost: number;
}

export async function lookupShipping(postalCode: string): Promise<ShippingInfo> {
  const res = await fetch(`${BASE_URL}/api/shipping?postalCode=${encodeURIComponent(postalCode)}`);
  return handle<ShippingInfo>(res);
}

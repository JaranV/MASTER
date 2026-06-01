import type { Order, PostalLookup, Product } from './types'

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL ?? 'http://localhost:8080'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function fetchProducts(): Promise<Product[]> {
  return fetch(`${BASE_URL}/api/products`).then(handle<Product[]>)
}

export function lookupPostalCode(code: string): Promise<PostalLookup | null> {
  return fetch(`${BASE_URL}/api/postal-code/${code}`).then((res) => {
    if (res.status === 404) return null
    return handle<PostalLookup>(res)
  })
}

export type CreateOrderPayload = {
  name: string
  email: string
  address: string
  phone: string
  postalCode: string
  cartItems: { productId: number; quantity: number }[]
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handle<Order>)
}

export function payOrder(orderId: number): Promise<{ url: string }> {
  return fetch(`${BASE_URL}/api/orders/${orderId}/pay`, {
    method: 'POST',
  }).then(handle<{ url: string }>)
}

export function fetchOrder(orderId: number): Promise<Order> {
  return fetch(`${BASE_URL}/api/orders/${orderId}`).then(handle<Order>)
}

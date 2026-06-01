import type { CartItem, Product } from './types'

export function computeSubtotal(items: CartItem[], products: Product[]): number {
  const byId = new Map(products.map((p) => [p.id, p]))
  return items.reduce((sum, it) => {
    const p = byId.get(it.productId)
    return p ? sum + p.price * it.quantity : sum
  }, 0)
}

export function computeDiscount(subtotal: number): number {
  return subtotal > 500 ? round2(subtotal * 0.1) : 0
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatNok(value: number): string {
  return `${value.toFixed(2)} NOK`
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../api'
import { useCart } from '../CartContext'
import { computeDiscount, computeSubtotal, formatNok } from '../pricing'
import type { Product } from '../types'

export function CartPage() {
  const { items, setQuantity, removeItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading cart…</p>

  if (items.length === 0) {
    return (
      <section>
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/">Browse products</Link>
      </section>
    )
  }

  const byId = new Map(products.map((p) => [p.id, p]))
  const subtotal = computeSubtotal(items, products)
  const discount = computeDiscount(subtotal)
  const afterDiscount = subtotal - discount

  return (
    <section>
      <h1>Cart</h1>
      <ul className="cart-list">
        {items.map((it) => {
          const p = byId.get(it.productId)
          if (!p) return null
          return (
            <li key={it.productId} className="cart-item">
              <img src={p.imageUrl} alt={p.name} />
              <div className="cart-item-details">
                <h3>{p.name}</h3>
                <p>{formatNok(p.price)} each</p>
              </div>
              <div className="cart-item-controls">
                <label>
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={p.stock}
                    value={it.quantity}
                    onChange={(e) =>
                      setQuantity(it.productId, Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </label>
                <button type="button" onClick={() => removeItem(it.productId)}>
                  Remove
                </button>
              </div>
              <div className="cart-item-total">{formatNok(p.price * it.quantity)}</div>
            </li>
          )
        })}
      </ul>

      <div className="summary">
        <div>
          <span>Subtotal</span>
          <span>{formatNok(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="discount-row">
            <span>Discount (10%)</span>
            <span>-{formatNok(discount)}</span>
          </div>
        )}
        <div className="total">
          <span>Total</span>
          <span>{formatNok(afterDiscount)}</span>
        </div>
        <p className="shipping-note">Shipping is calculated at checkout.</p>
        <Link to="/checkout" className="checkout-button">
          Proceed to checkout
        </Link>
      </div>
    </section>
  )
}

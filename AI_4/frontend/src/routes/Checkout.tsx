import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CartEntry } from '../types.ts'

const API = import.meta.env.VITE_API_URL

function Checkout({ cart, clearCart }: { cart: CartEntry[]; clearCart: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (cart.length === 0) {
    return (
      <div className="empty-msg">
        <p>Your cart is empty.</p>
        <br />
        <Link to="/" className="btn-primary">Browse products</Link>
      </div>
    )
  }

  let total = 0
  for (const entry of cart) {
    total += entry.product.price * entry.count
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      // Step 1: create order
      const orderRes = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          address,
          cartItems: cart.map(entry => ({
            productid: entry.product.id,
            count: entry.count,
          })),
        }),
      })

      if (!orderRes.ok) {
        const text = await orderRes.text()
        throw new Error(text || 'Failed to create order')
      }

      const order = await orderRes.json()

      // Step 2: get payment URL
      const payRes = await fetch(`${API}/api/orders/${order.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!payRes.ok) {
        throw new Error('Failed to initiate payment')
      }

      const payData = await payRes.json()

      // Step 3: redirect to Stripe
      clearCart()
      window.location.href = payData.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2>Checkout</h2>
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Address</label>
          <input value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? 'Processing...' : 'Pay with Stripe'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </form>

      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.map(entry => (
          <div className="summary-item" key={entry.product.id}>
            <span>{entry.product.name} x{entry.count}</span>
            <span>{(entry.product.price * entry.count).toFixed(2)} kr</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total</span>
          <span>{total.toFixed(2)} kr</span>
        </div>
      </div>
    </div>
  )
}

export default Checkout

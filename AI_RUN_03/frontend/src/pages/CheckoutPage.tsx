import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder, fetchProducts, lookupPostalCode, payOrder } from '../api'
import { useCart } from '../CartContext'
import { computeDiscount, computeSubtotal, formatNok } from '../pricing'
import type { PostalLookup, Product } from '../types'

const PHONE_PATTERN = /^[49]\d{7}$/
const POSTAL_PATTERN = /^\d{4}$/

export function CheckoutPage() {
  const { items } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [postalInfo, setPostalInfo] = useState<PostalLookup | null>(null)
  const [postalError, setPostalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!POSTAL_PATTERN.test(postalCode)) {
      setPostalInfo(null)
      setPostalError(null)
      return
    }
    let cancelled = false
    lookupPostalCode(postalCode)
      .then((info) => {
        if (cancelled) return
        if (!info) {
          setPostalInfo(null)
          setPostalError('Unknown postal code')
        } else {
          setPostalInfo(info)
          setPostalError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setPostalError('Lookup failed')
      })
    return () => {
      cancelled = true
    }
  }, [postalCode])

  const subtotal = useMemo(() => computeSubtotal(items, products), [items, products])
  const discount = useMemo(() => computeDiscount(subtotal), [subtotal])
  const shippingCost = postalInfo?.shippingCost ?? 0
  const total = subtotal - discount + shippingCost

  const phoneValid = PHONE_PATTERN.test(phone)
  const phoneError = phone.length > 0 && !phoneValid
    ? 'Phone must be 8 digits starting with 4 or 9'
    : null

  const formValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    address.trim().length > 0 &&
    phoneValid &&
    POSTAL_PATTERN.test(postalCode) &&
    postalInfo !== null &&
    items.length > 0

  if (loading) return <p>Loading checkout…</p>

  if (items.length === 0) {
    return (
      <section>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/">Browse products</Link>
      </section>
    )
  }

  const byId = new Map(products.map((p) => [p.id, p]))

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await createOrder({
        name,
        email,
        address,
        phone,
        postalCode,
        cartItems: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
      })
      const { url } = await payOrder(order.id)
      if (url) {
        window.location.assign(url)
      } else {
        navigate(`/confirmation/${order.id}`)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <section className="checkout">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <form onSubmit={onSubmit} className="checkout-form">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Address
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </label>
          <label>
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              required
              aria-invalid={phoneError !== null}
            />
            {phoneError && <span className="field-error">{phoneError}</span>}
          </label>
          <label>
            Postal code
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              inputMode="numeric"
              maxLength={4}
              required
              aria-invalid={postalError !== null}
            />
            {postalError && <span className="field-error">{postalError}</span>}
            {postalInfo && (
              <span className="field-info">
                {postalInfo.city} · Zone {postalInfo.shippingZone} ·{' '}
                {formatNok(postalInfo.shippingCost)} shipping
              </span>
            )}
          </label>

          {submitError && <p className="error">{submitError}</p>}

          <button type="submit" disabled={!formValid || submitting}>
            {submitting ? 'Processing…' : 'Pay with Stripe'}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <ul>
            {items.map((it) => {
              const p = byId.get(it.productId)
              if (!p) return null
              return (
                <li key={it.productId}>
                  <span>
                    {p.name} × {it.quantity}
                  </span>
                  <span>{formatNok(p.price * it.quantity)}</span>
                </li>
              )
            })}
          </ul>
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatNok(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-line discount-row">
              <span>Discount (10%)</span>
              <span>-{formatNok(discount)}</span>
            </div>
          )}
          <div className="summary-line">
            <span>Shipping{postalInfo ? ` (Zone ${postalInfo.shippingZone})` : ''}</span>
            <span>{formatNok(shippingCost)}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span>{formatNok(total)}</span>
          </div>
        </aside>
      </div>
    </section>
  )
}

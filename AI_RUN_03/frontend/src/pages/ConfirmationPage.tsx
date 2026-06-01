import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrder } from '../api'
import { useCart } from '../CartContext'
import { formatNok } from '../pricing'
import type { Order } from '../types'

export function ConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { clear } = useCart()

  useEffect(() => {
    if (!orderId) return
    const id = Number(orderId)
    if (Number.isNaN(id)) {
      setError('Invalid order id')
      setLoading(false)
      return
    }
    fetchOrder(id)
      .then((o) => {
        setOrder(o)
        clear()
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [orderId, clear])

  if (loading) return <p>Loading order…</p>
  if (error) return <p className="error">Error: {error}</p>
  if (!order) return <p>Order not found.</p>

  return (
    <section className="confirmation">
      <h1>Thank you for your order!</h1>
      <p>
        Order #{order.id} — status:{' '}
        <strong className={`status status-${order.status.toLowerCase()}`}>{order.status}</strong>
      </p>
      <div className="confirmation-details">
        <div>
          <h2>Shipping to</h2>
          <p>{order.name}</p>
          <p>{order.address}</p>
          <p>
            {order.postalCode} {order.city}
          </p>
          <p>{order.phone}</p>
          <p>{order.email}</p>
        </div>
        <div>
          <h2>Items</h2>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>{formatNok(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatNok(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="summary-line discount-row">
              <span>Discount</span>
              <span>-{formatNok(order.discount)}</span>
            </div>
          )}
          <div className="summary-line">
            <span>Shipping (Zone {order.shippingZone})</span>
            <span>{formatNok(order.shippingCost)}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span>{formatNok(order.totalPrice)}</span>
          </div>
        </div>
      </div>
      <Link to="/" className="checkout-button">
        Continue shopping
      </Link>
    </section>
  )
}

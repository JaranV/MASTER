import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder } from '../api';
import type { Order } from '../types';

export default function Confirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchOrder(parseInt(id, 10))
      .then(setOrder)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">Could not load order: {error}</p>;
  if (!order) return <p>Loading order…</p>;

  return (
    <section className="confirmation-page">
      <h1>Thank you for your order!</h1>
      <p>Order #{order.id} — status: <strong>{order.status}</strong></p>
      <div className="details">
        <h2>Shipping to</h2>
        <p>{order.name}</p>
        <p>{order.address}</p>
        <p>{order.postalCode} {order.city}</p>
        <p>{order.phone}</p>
        <p>{order.email}</p>
      </div>
      <div className="details">
        <h2>Items</h2>
        <ul>
          {order.items.map((i) => (
            <li key={i.id}>
              <span>{i.product.name} × {i.quantity}</span>
              <span>{(i.price * i.quantity).toFixed(2)} NOK</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="totals">
        <div><span>Subtotal</span><span>{order.subtotal.toFixed(2)} NOK</span></div>
        {order.discount > 0 && <div><span>Discount</span><span>-{order.discount.toFixed(2)} NOK</span></div>}
        <div><span>Shipping (Zone {order.shippingZone})</span><span>{order.shippingCost.toFixed(2)} NOK</span></div>
        <div className="grand"><span>Total</span><span>{order.totalPrice.toFixed(2)} NOK</span></div>
      </div>
      <Link to="/" className="continue">Continue shopping</Link>
    </section>
  );
}

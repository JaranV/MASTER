import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrder } from "../api";
import { useCart } from "../cart";
import type { Order } from "../types";

export function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { clear } = useCart();

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(Number(orderId))
      .then((o) => {
        setOrder(o);
        clear();
      })
      .catch((e: Error) => setError(e.message));
  }, [orderId, clear]);

  if (error) {
    return (
      <div className="page">
        <h1>Something went wrong</h1>
        <p className="error">{error}</p>
        <Link to="/">Continue shopping</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Thank you for your order!</h1>
      <p>
        Order #{order.id} — status:{" "}
        <strong>{order.status}</strong>
      </p>
      <p>
        Shipping to: {order.name}, {order.address}, {order.postalCode}{" "}
        {order.city}
      </p>
      <h2>Items</h2>
      <ul className="order-items">
        {order.items.map((i) => (
          <li key={i.id}>
            <span>
              {i.product.name} × {i.quantity}
            </span>
            <span>{(i.price * i.quantity).toFixed(2)} NOK</span>
          </li>
        ))}
      </ul>
      <div className="summary">
        <div>
          <span>Subtotal:</span>
          <span>{order.subtotal.toFixed(2)} NOK</span>
        </div>
        {order.discount > 0 && (
          <div className="discount">
            <span>Discount:</span>
            <span>-{order.discount.toFixed(2)} NOK</span>
          </div>
        )}
        <div>
          <span>Shipping (Zone {order.shippingZone}):</span>
          <span>
            {order.shippingCost === 0
              ? "Free"
              : `${order.shippingCost.toFixed(2)} NOK`}
          </span>
        </div>
        <div className="total">
          <span>Total:</span>
          <span>{order.totalPrice.toFixed(2)} NOK</span>
        </div>
      </div>
      <Link to="/" className="primary">
        Continue shopping
      </Link>
    </div>
  );
}

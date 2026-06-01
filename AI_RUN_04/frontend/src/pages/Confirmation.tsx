import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrder } from "../api";
import type { Order } from "../types";
import { useCart } from "../CartContext";
import { formatNok } from "../pricing";

export function Confirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);

  useEffect(() => {
    if (!id) return;
    const orderId = Number(id);
    if (!Number.isFinite(orderId)) {
      setError("Invalid order id");
      return;
    }
    let active = true;
    fetchOrder(orderId)
      .then((o) => {
        if (!active) return;
        setOrder(o);
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <section className="page">
        <h1>Order Confirmation</h1>
        <p className="error">{error}</p>
        <Link to="/" className="primary-link">
          Continue shopping
        </Link>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="page">
        <h1>Order Confirmation</h1>
        <p>Loading order...</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Thank you for your order</h1>
      <p>
        Order <strong>#{order.id}</strong> — status{" "}
        <strong>{order.status}</strong>
      </p>

      <div className="summary-box">
        <h2>Shipping to</h2>
        <p>
          {order.name}
          <br />
          {order.address}
          <br />
          {order.postalCode} {order.city}
          <br />
          {order.email} · {order.phone}
        </p>
      </div>

      <div className="summary-box">
        <h2>Items</h2>
        <ul>
          {order.items.map((it) => (
            <li key={it.id}>
              <span>
                {it.product.name} × {it.quantity}
              </span>
              <span>{formatNok(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{formatNok(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="discount">
              <span>Discount</span>
              <span>-{formatNok(order.discount)}</span>
            </div>
          )}
          <div>
            <span>Shipping (Zone {order.shippingZone})</span>
            <span>
              {order.shippingCost === 0
                ? "Free"
                : formatNok(order.shippingCost)}
            </span>
          </div>
          <div className="grand">
            <span>Total</span>
            <span>{formatNok(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      <Link to="/" className="primary-link">
        Continue shopping
      </Link>
    </section>
  );
}

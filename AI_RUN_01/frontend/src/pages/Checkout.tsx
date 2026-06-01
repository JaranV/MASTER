import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, fetchProducts, lookupShipping, payOrder, type ShippingInfo } from '../api';
import { useCart } from '../cart';
import type { Product } from '../types';

const PHONE_RE = /^[49]\d{7}$/;
const POSTAL_RE = /^\d{4}$/;

export default function Checkout() {
  const navigate = useNavigate();
  const { entries, subtotal, discount, clear } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!POSTAL_RE.test(postalCode)) {
      setShipping(null);
      setShippingError(null);
      return;
    }
    let cancelled = false;
    lookupShipping(postalCode)
      .then((info) => {
        if (!cancelled) {
          setShipping(info);
          setShippingError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setShipping(null);
          setShippingError(e.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [postalCode]);

  const phoneValid = PHONE_RE.test(phone);
  const postalValid = POSTAL_RE.test(postalCode);
  const s = subtotal(products);
  const d = discount(products);
  const shippingCost = shipping?.cost ?? 0;
  const total = Math.round((s - d + shippingCost) * 100) / 100;

  const canSubmit =
    name.trim() &&
    email.trim() &&
    address.trim() &&
    phoneValid &&
    postalValid &&
    shipping &&
    entries.length > 0 &&
    !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        name,
        email,
        address,
        phone,
        postalCode,
        cartItems: entries.map((x) => ({ productId: x.productId, quantity: x.quantity })),
      });
      const { url } = await payOrder(order.id);
      clear();
      window.location.href = url;
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <section className="checkout-page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/')}>Back to products</button>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <form onSubmit={submit} className="checkout-form">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Address
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </label>
          <label>
            Phone (Norwegian mobile, 8 digits starting with 4 or 9)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {phone && !phoneValid && (
              <span className="field-error">Phone must be 8 digits and start with 4 or 9</span>
            )}
          </label>
          <label>
            Postal code
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength={4}
              required
            />
            {postalCode && !postalValid && (
              <span className="field-error">Postal code must be 4 digits</span>
            )}
            {shippingError && <span className="field-error">{shippingError}</span>}
            {shipping && (
              <span className="field-info">
                {shipping.city} · Zone {shipping.zone} · Shipping: {shipping.cost.toFixed(2)} NOK
              </span>
            )}
          </label>
          {submitError && <p className="error">{submitError}</p>}
          <button type="submit" disabled={!canSubmit}>
            {submitting ? 'Processing…' : 'Pay with Stripe'}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <ul>
            {entries.map((entry) => {
              const p = products.find((pr) => pr.id === entry.productId);
              if (!p) return null;
              return (
                <li key={entry.productId}>
                  <span>{p.name} × {entry.quantity}</span>
                  <span>{(p.price * entry.quantity).toFixed(2)} NOK</span>
                </li>
              );
            })}
          </ul>
          <div className="row"><span>Subtotal</span><span>{s.toFixed(2)} NOK</span></div>
          {d > 0 && <div className="row discount"><span>Discount (10%)</span><span>-{d.toFixed(2)} NOK</span></div>}
          <div className="row"><span>Shipping</span><span>{shipping ? `${shipping.cost.toFixed(2)} NOK` : '—'}</span></div>
          <div className="row total"><span>Total</span><span>{total.toFixed(2)} NOK</span></div>
        </aside>
      </div>
    </section>
  );
}

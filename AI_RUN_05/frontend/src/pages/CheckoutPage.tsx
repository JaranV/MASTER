import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createOrder,
  fetchProducts,
  lookupPostalCode,
  startCheckout,
} from "../api";
import { computeDiscount, useCart } from "../cart";
import type { PostalCodeInfo, Product } from "../types";

function validatePhone(phone: string): boolean {
  return /^[49]\d{7}$/.test(phone);
}

function validatePostal(code: string): boolean {
  return /^\d{4}$/.test(code);
}

export function CheckoutPage() {
  const { items } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    postalCode: "",
  });
  const [postalInfo, setPostalInfo] = useState<PostalCodeInfo | null>(null);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    const code = form.postalCode;
    if (!validatePostal(code)) {
      setPostalInfo(null);
      setPostalError(null);
      return;
    }
    let cancelled = false;
    lookupPostalCode(code)
      .then((info) => {
        if (cancelled) return;
        if (!info) {
          setPostalInfo(null);
          setPostalError("Unknown postal code");
        } else {
          setPostalInfo(info);
          setPostalError(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPostalInfo(null);
        setPostalError("Could not look up postal code");
      });
    return () => {
      cancelled = true;
    };
  }, [form.postalCode]);

  const lines = useMemo(() => {
    return items
      .map((i) => {
        const product = products.find((p) => p.id === i.productId);
        return product ? { product, quantity: i.quantity } : null;
      })
      .filter((x): x is { product: Product; quantity: number } => x !== null);
  }, [items, products]);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.product.price * l.quantity, 0),
    [lines],
  );
  const discount = computeDiscount(subtotal);
  const shipping = postalInfo?.shippingCost ?? 0;
  const total = subtotal - discount + shipping;

  const phoneValid = validatePhone(form.phone);
  const postalValid = validatePostal(form.postalCode);
  const phoneTouched = form.phone.length > 0;
  const postalTouched = form.postalCode.length > 0;

  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.address.trim() !== "" &&
    phoneValid &&
    postalValid &&
    postalInfo !== null &&
    lines.length > 0 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        ...form,
        cartItems: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      const session = await startCheckout(order.id);
      window.location.href = session.url;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (lines.length === 0 && !submitting) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p>
          Your cart is empty. <Link to="/">Browse products</Link>.
        </p>
      </div>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="page checkout">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="checkout-form">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </label>
          <label>
            Address
            <input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              inputMode="numeric"
              required
            />
            {phoneTouched && !phoneValid && (
              <span className="field-error">
                Must be 8 digits, starting with 4 or 9
              </span>
            )}
          </label>
          <label>
            Postal code
            <input
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              inputMode="numeric"
              maxLength={4}
              required
            />
            {postalTouched && !postalValid && (
              <span className="field-error">Must be 4 digits</span>
            )}
            {postalValid && postalError && (
              <span className="field-error">{postalError}</span>
            )}
            {postalInfo && (
              <span className="hint">
                {postalInfo.city} — Zone {postalInfo.shippingZone} (
                {postalInfo.shippingCost === 0
                  ? "free shipping"
                  : `${postalInfo.shippingCost.toFixed(2)} NOK`}
                )
              </span>
            )}
          </label>

          {submitError && <p className="error">{submitError}</p>}

          <button type="submit" disabled={!canSubmit} className="primary">
            {submitting ? "Redirecting..." : "Pay with Stripe"}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <ul>
            {lines.map(({ product, quantity }) => (
              <li key={product.id}>
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{(product.price * quantity).toFixed(2)} NOK</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} NOK</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount">
              <span>Discount (10%)</span>
              <span>-{discount.toFixed(2)} NOK</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {postalInfo
                ? postalInfo.shippingCost === 0
                  ? "Free"
                  : `${postalInfo.shippingCost.toFixed(2)} NOK`
                : "—"}
            </span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{total.toFixed(2)} NOK</span>
          </div>
        </aside>
      </div>
      <p>
        <button type="button" onClick={() => navigate("/cart")} className="link-btn">
          Back to cart
        </button>
      </p>
    </div>
  );
}

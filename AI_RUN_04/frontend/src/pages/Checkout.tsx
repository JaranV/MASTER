import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder, fetchProducts, lookupPostal, payOrder } from "../api";
import type { PostalLookup } from "../api";
import type { Product } from "../types";
import { useCart } from "../CartContext";
import {
  computeDiscount,
  formatNok,
  isValidNorwegianMobile,
} from "../pricing";

type ResolvedItem = {
  product: Product;
  quantity: number;
};

export function Checkout() {
  const { items } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [postal, setPostal] = useState<PostalLookup | null>(null);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [postalLoading, setPostalLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch((e: Error) => {
        if (!active) return;
        setProductError(e.message);
        setLoadingProducts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const resolved: ResolvedItem[] = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return items
      .map((it) => {
        const product = map.get(it.productId);
        return product ? { product, quantity: it.quantity } : null;
      })
      .filter((it): it is ResolvedItem => it !== null);
  }, [items, products]);

  const subtotal = resolved.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0,
  );
  const discount = computeDiscount(subtotal);
  const shippingCost = postal?.shippingCost ?? 0;
  const total = subtotal - discount + shippingCost;

  useEffect(() => {
    if (!/^\d{4}$/.test(postalCode)) {
      setPostal(null);
      setPostalError(null);
      return;
    }
    let active = true;
    setPostalLoading(true);
    lookupPostal(postalCode)
      .then((p) => {
        if (!active) return;
        setPostal(p);
        setPostalError(null);
        setPostalLoading(false);
      })
      .catch((e: Error) => {
        if (!active) return;
        setPostal(null);
        setPostalError(e.message);
        setPostalLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postalCode]);

  const phoneValid = phone === "" || isValidNorwegianMobile(phone);
  const phoneError =
    phone !== "" && !phoneValid
      ? "Phone must be 8 digits, starting with 4 or 9"
      : null;

  const canSubmit =
    !submitting &&
    resolved.length > 0 &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    address.trim().length > 0 &&
    isValidNorwegianMobile(phone) &&
    postal !== null;

  async function handleSubmit(e: React.FormEvent) {
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
        cartItems: items,
      });
      const pay = await payOrder(order.id);
      window.location.href = pay.url;
    } catch (e) {
      setSubmitError((e as Error).message);
      setSubmitting(false);
    }
  }

  if (loadingProducts) {
    return (
      <section className="page">
        <h1>Checkout</h1>
        <p>Loading...</p>
      </section>
    );
  }

  if (productError) {
    return (
      <section className="page">
        <h1>Checkout</h1>
        <p className="error">Failed to load products: {productError}</p>
      </section>
    );
  }

  if (resolved.length === 0) {
    return (
      <section className="page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button className="secondary" onClick={() => navigate("/")}>
          Continue shopping
        </button>
      </section>
    );
  }

  return (
    <section className="page checkout">
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Address
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={phoneError !== null}
            />
            {phoneError && <span className="field-error">{phoneError}</span>}
          </label>

          <label>
            Postal code
            <input
              type="text"
              required
              maxLength={4}
              value={postalCode}
              onChange={(e) =>
                setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
            {postalLoading && <span className="field-hint">Looking up...</span>}
            {postal && !postalLoading && (
              <span className="field-hint">
                {postal.city} — Zone {postal.zone} —{" "}
                {postal.shippingCost === 0
                  ? "Free shipping"
                  : `${formatNok(postal.shippingCost)} shipping`}
              </span>
            )}
            {postalError && !postalLoading && (
              <span className="field-error">{postalError}</span>
            )}
          </label>

          {submitError && <p className="error">{submitError}</p>}

          <button type="submit" className="primary" disabled={!canSubmit}>
            {submitting ? "Processing..." : "Pay with Stripe"}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <ul>
            {resolved.map((it) => (
              <li key={it.product.id}>
                <span>
                  {it.product.name} × {it.quantity}
                </span>
                <span>{formatNok(it.product.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="totals">
            <div>
              <span>Subtotal</span>
              <span>{formatNok(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="discount">
                <span>Discount (10%)</span>
                <span>-{formatNok(discount)}</span>
              </div>
            )}
            <div>
              <span>Shipping</span>
              <span>
                {postal
                  ? shippingCost === 0
                    ? "Free"
                    : formatNok(shippingCost)
                  : "—"}
              </span>
            </div>
            <div className="grand">
              <span>Total</span>
              <span>{postal ? formatNok(total) : "—"}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

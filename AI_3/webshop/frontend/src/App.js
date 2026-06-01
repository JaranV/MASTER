import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';

const API = 'http://localhost:8080/api';

/* ─── Cart Context ─── */
const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock, imageUrl: product.imageUrl }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() { return useContext(CartContext); }

/* ─── Header ─── */
function Header() {
  const { cartCount } = useCart();
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">▲</span>
          <span className="logo-text">Fjellbutikken</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Produkter</Link>
          <Link to="/cart" className="nav-link cart-link">
            Handlekurv
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ─── Toast ─── */
function Toast({ message, visible }) {
  return <div className={`toast ${visible ? 'toast-visible' : ''}`}>{message}</div>;
}

/* ─── Product Listing ─── */
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', visible: false });
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Failed to fetch products', e);
    }
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch(`${API}/products/categories`).then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
  };

  const handleAdd = (product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    showToast(`${product.name} lagt i kurven`);
  };

  return (
    <main className="page">
      <div className="hero">
        <h1 className="hero-title">Norsk Friluftsutstyr</h1>
        <p className="hero-sub">Kvalitetsutstyr for fjell, skog og vidde</p>
      </div>

      <div className="filters">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Søk etter produkter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          <button
            className={`cat-btn ${!category ? 'cat-active' : ''}`}
            onClick={() => setCategory('')}
          >Alle</button>
          {categories.map(c => (
            <button
              key={c}
              className={`cat-btn ${category === c ? 'cat-active' : ''}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>Ingen produkter funnet</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-img-wrap">
                <img src={p.imageUrl} alt={p.name} className="product-img" loading="lazy" />
                {p.lowStock && p.stock > 0 && (
                  <span className="badge badge-low">Kun {p.stock} igjen</span>
                )}
                {p.stock === 0 && (
                  <span className="badge badge-out">Utsolgt</span>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{p.category}</span>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-desc">{p.description}</p>
                <div className="product-bottom">
                  <span className="product-price">{p.price.toLocaleString('nb-NO')} kr</span>
                  <button
                    className={`add-btn ${p.stock === 0 ? 'add-btn-disabled' : ''}`}
                    onClick={() => handleAdd(p)}
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? 'Utsolgt' : '+ Legg til'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast message={toast.message} visible={toast.visible} />
    </main>
  );
}

/* ─── Cart Page ─── */
function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <main className="page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Handlekurven er tom</h2>
          <p>Legg til noen produkter for å komme i gang</p>
          <Link to="/" className="btn-primary">Se produkter</Link>
        </div>
      </main>
    );
  }

  const hasDiscount = cartTotal > 500;
  const discount = hasDiscount ? cartTotal * 0.1 : 0;

  return (
    <main className="page">
      <h1 className="page-title">Handlekurv</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">{item.price.toLocaleString('nb-NO')} kr</p>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, item.stock))}>+</button>
              </div>
              <div className="cart-item-total">
                {(item.price * item.quantity).toLocaleString('nb-NO')} kr
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.productId)} title="Fjern">✕</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Sammendrag</h3>
          <div className="summary-row">
            <span>Delsum</span>
            <span>{cartTotal.toLocaleString('nb-NO')} kr</span>
          </div>
          {hasDiscount && (
            <div className="summary-row summary-discount">
              <span>Rabatt (10%)</span>
              <span>−{discount.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} kr</span>
            </div>
          )}
          <div className="summary-row summary-note">
            <span>Frakt</span>
            <span>Beregnes ved utsjekk</span>
          </div>
          {!hasDiscount && (
            <div className="discount-hint">
              Bruk {(500 - cartTotal).toLocaleString('nb-NO')} kr til for 10% rabatt!
            </div>
          )}
          <button className="btn-primary btn-full" onClick={() => navigate('/checkout')}>
            Gå til utsjekk
          </button>
        </div>
      </div>
    </main>
  );
}

/* ─── Checkout Page ─── */
function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', address: '', postalCode: '' });
  const [city, setCity] = useState('');
  const [shipping, setShipping] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
  }, [cart, navigate]);

  // Postal code lookup
  useEffect(() => {
    if (form.postalCode.length === 4 && /^\d{4}$/.test(form.postalCode)) {
      fetch(`${API}/postal/${form.postalCode}`)
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Not found');
        })
        .then(data => {
          setCity(data.city);
          setShipping(data.shippingCost);
          setErrors(prev => ({ ...prev, postalCode: undefined }));
        })
        .catch(() => {
          setCity('');
          setShipping(null);
          setErrors(prev => ({ ...prev, postalCode: 'Ugyldig postnummer' }));
        });
    } else {
      setCity('');
      setShipping(null);
    }
  }, [form.postalCode]);

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Navn er påkrevd';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ugyldig e-post';
    if (!form.phone.trim() || !/^[49]\d{7}$/.test(form.phone)) errs.phone = 'Norsk mobilnummer (8 siffer, starter med 4 eller 9)';
    if (!form.address.trim()) errs.address = 'Adresse er påkrevd';
    if (!form.postalCode.trim() || !/^\d{4}$/.test(form.postalCode)) errs.postalCode = 'Ugyldig postnummer';
    else if (!city) errs.postalCode = 'Postnummer ikke funnet';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      // Create order
      const orderRes = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Kunne ikke opprette ordre');
      }

      const order = await orderRes.json();

      // Initiate payment
      const payRes = await fetch(`${API}/orders/${order.id}/pay`, { method: 'POST' });

      if (!payRes.ok) {
        const err = await payRes.json();
        throw new Error(err.error || 'Kunne ikke starte betaling');
      }

      const { checkoutUrl } = await payRes.json();
      clearCart();
      window.location.href = checkoutUrl;
    } catch (e) {
      setServerError(e.message);
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const hasDiscount = cartTotal > 500;
  const discount = hasDiscount ? cartTotal * 0.1 : 0;
  const total = cartTotal - discount + (shipping || 0);

  return (
    <main className="page">
      <h1 className="page-title">Utsjekk</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2 className="form-section-title">Leveringsinformasjon</h2>

          <div className="form-group">
            <label className="form-label">Fullt navn</label>
            <input className={`form-input ${errors.customerName ? 'input-error' : ''}`} value={form.customerName} onChange={update('customerName')} placeholder="Ola Nordmann" />
            {errors.customerName && <span className="field-error">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">E-post</label>
            <input className={`form-input ${errors.email ? 'input-error' : ''}`} type="email" value={form.email} onChange={update('email')} placeholder="ola@eksempel.no" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Telefon</label>
            <input className={`form-input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={update('phone')} placeholder="9XXXXXXX" maxLength={8} />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input className={`form-input ${errors.address ? 'input-error' : ''}`} value={form.address} onChange={update('address')} placeholder="Storgata 1" />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group form-group-short">
              <label className="form-label">Postnummer</label>
              <input className={`form-input ${errors.postalCode ? 'input-error' : ''}`} value={form.postalCode} onChange={update('postalCode')} placeholder="4000" maxLength={4} />
              {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
            </div>
            <div className="form-group form-group-long">
              <label className="form-label">Poststed</label>
              <input className="form-input form-input-readonly" value={city} readOnly placeholder="Fylles inn automatisk" tabIndex={-1} />
            </div>
          </div>

          {serverError && <div className="server-error">{serverError}</div>}

          <button type="submit" className="btn-primary btn-full btn-pay" disabled={submitting}>
            {submitting ? (
              <span className="btn-loading"><span className="spinner-sm" /> Behandler...</span>
            ) : (
              `Betal ${total.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} kr`
            )}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Din bestilling</h3>
          <div className="checkout-items">
            {cart.map(item => (
              <div key={item.productId} className="checkout-item">
                <img src={item.imageUrl} alt={item.name} className="checkout-item-img" />
                <div className="checkout-item-detail">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">Antall: {item.quantity}</span>
                </div>
                <span className="checkout-item-price">{(item.price * item.quantity).toLocaleString('nb-NO')} kr</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-row"><span>Delsum</span><span>{cartTotal.toLocaleString('nb-NO')} kr</span></div>
          {hasDiscount && (
            <div className="summary-row summary-discount"><span>Rabatt (10%)</span><span>−{discount.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} kr</span></div>
          )}
          <div className="summary-row"><span>Frakt</span><span>{shipping != null ? `${shipping} kr` : '—'}</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Totalt</span><span>{total.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} kr</span></div>
        </div>
      </div>
    </main>
  );
}

/* ─── Order Confirmation ─── */
function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/orders/${orderId}`)
      .then(r => r.json())
      .then(data => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) return <main className="page"><div className="loading"><div className="spinner" /></div></main>;
  if (!order) return <main className="page"><div className="empty-state"><p>Ordre ikke funnet</p></div></main>;

  return (
    <main className="page">
      <div className="confirmation">
        <div className="confirmation-icon">✓</div>
        <h1 className="confirmation-title">Takk for din bestilling!</h1>
        <p className="confirmation-sub">Ordre #{order.id} er {order.status === 'PAID' ? 'betalt' : 'registrert'}</p>

        <div className="confirmation-card">
          <div className="conf-section">
            <h3>Leveringsadresse</h3>
            <p>{order.customerName}</p>
            <p>{order.address}</p>
            <p>{order.postalCode} {order.city}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
          </div>

          <div className="conf-section">
            <h3>Bestilte produkter</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="conf-item">
                <span>{item.productName} × {item.quantity}</span>
                <span>{item.lineTotal.toLocaleString('nb-NO')} kr</span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />
          <div className="summary-row"><span>Delsum</span><span>{order.subtotal.toLocaleString('nb-NO')} kr</span></div>
          {order.discount > 0 && (
            <div className="summary-row summary-discount"><span>Rabatt</span><span>−{order.discount.toLocaleString('nb-NO')} kr</span></div>
          )}
          <div className="summary-row"><span>Frakt</span><span>{order.shippingCost.toLocaleString('nb-NO')} kr</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Totalt</span><span>{order.total.toLocaleString('nb-NO')} kr</span></div>
        </div>

        <Link to="/" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>Tilbake til butikken</Link>
      </div>
    </main>
  );
}

/* ─── App Root ─── */
function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

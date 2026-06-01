import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { load, total, discount, remove, setQty, clear } from './cart'
import type { CartItem } from './types'

export default function Layout() {
  const [cart, setCart] = useState<CartItem[]>(load)
  const [open, setOpen] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    const sync = () => setCart(load())
    window.addEventListener('cart-update', sync)
    return () => window.removeEventListener('cart-update', sync)
  }, [])

  const count = cart.reduce((s, i) => s + i.quantity, 0)
  const sub = total(cart)
  const disc = discount(sub)

  function checkout() {
    setOpen(false)
    nav('/checkout')
  }

  return (
    <>
      <header>
        <div className="c h-inner">
          <a href="/" className="logo">SHOP</a>
          <button className="cart-btn" onClick={() => setOpen(true)}>
            🛒 Handlekurv <span className="badge">{count}</span>
          </button>
        </div>
      </header>

      <main className="c"><Outlet context={{ cartUpdated: () => setCart(load()) }} /></main>

      {open && (
        <div className="modal-bg" onClick={() => setOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2 style={{margin:0}}>Handlekurv ({count})</h2>
              <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <p style={{color:'var(--muted)',fontSize:'.9rem'}}>Ingen varer ennå.</p>
            ) : (
              <>
                {cart.map(i => (
                  <div className="ci" key={i.product.id}>
                    <div className="ci-info">
                      <div className="ci-name">{i.product.name}</div>
                      <div className="ci-p">{i.product.price} kr × {i.quantity} = {(i.product.price * i.quantity).toFixed(0)} kr</div>
                    </div>
                    <div className="ci-qty">
                      <button className="q-btn" onClick={() => { setQty(i.product.id, i.quantity - 1); setCart(load()) }}>−</button>
                      <span>{i.quantity}</span>
                      <button className="q-btn" onClick={() => { setQty(i.product.id, i.quantity + 1); setCart(load()) }}>+</button>
                      <button className="q-btn" style={{color:'var(--red)'}} onClick={() => { remove(i.product.id); setCart(load()) }}>✕</button>
                    </div>
                  </div>
                ))}
                <div className="totals">
                  <div className="tot-row"><span>Subtotal</span><span>{sub.toFixed(0)} kr</span></div>
                  {disc > 0 && <div className="tot-row disc"><span>Rabatt 10%</span><span>−{disc.toFixed(0)} kr</span></div>}
                  <div className="tot-row grand"><span>Sum</span><span>{(sub - disc).toFixed(0)} kr</span></div>
                  <button className="btn-primary" style={{width:'100%',marginTop:'.5rem'}} onClick={checkout}>Til kassen →</button>
                  <button className="btn-ghost btn-sm" style={{width:'100%'}} onClick={() => { clear(); setCart([]) }}>Tøm kurv</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

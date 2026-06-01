import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { load, total, discount, clear } from '../cart'
import { createOrder, payOrder } from '../api'
import type { CartItem } from '../types'

function zoneInfo(code: string) {
  const n = parseInt(code)
  if (isNaN(n) || code.length !== 4) return null
  if (n >= 4000 && n <= 4099) return { zone: 1, cost: 0, label: 'Gratis frakt (Sone 1 – Stavanger)' }
  if (n >= 4100 && n <= 4999) return { zone: 2, cost: 49, label: '49 kr frakt (Sone 2 – Rogaland)' }
  return { zone: 3, cost: 99, label: '99 kr frakt (Sone 3)' }
}

function validPhone(p: string) { return /^[49]\d{7}$/.test(p) }

export default function Checkout() {
  const nav = useNavigate()
  const [cart] = useState<CartItem[]>(load)
  const [form, setForm] = useState({ name:'', email:'', address:'', phone:'', postalCode:'' })
  const [phoneErr, setPhoneErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const sub = total(cart)
  const disc = discount(sub)
  const zi = zoneInfo(form.postalCode)
  const shipCost = zi?.cost ?? 0
  const finalTotal = sub - disc + shipCost

  useEffect(() => { if (cart.length === 0) nav('/') }, [cart, nav])

  function set(k: keyof typeof form, v: string) { setForm(f => ({...f, [k]: v})) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validPhone(form.phone)) { setPhoneErr('Ugyldig norsk mobilnummer (8 siffer, starter med 4 eller 9)'); return }
    setPhoneErr('')
    setLoading(true); setErr('')
    try {
      const order = await createOrder({
        ...form,
        cartItems: cart.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      })
      const { url } = await payOrder(order.id)
      clear()
      window.location.href = url
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Feil')
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Kasse</h1>
      <div className="co-grid">
        <form onSubmit={submit} className="panel fg">
          <h2>Leveringsinformasjon</h2>
          {['name','email','address'].map(k => (
            <div className="frow" key={k}>
              <label>{k === 'name' ? 'Navn' : k === 'email' ? 'E-post' : 'Adresse'}</label>
              <input required type={k === 'email' ? 'email' : 'text'}
                value={form[k as keyof typeof form]}
                onChange={e => set(k as keyof typeof form, e.target.value)} />
            </div>
          ))}
          <div className="frow">
            <label>Telefon</label>
            <input required value={form.phone} onChange={e => { set('phone', e.target.value); setPhoneErr('') }} placeholder="91234567" />
            {phoneErr && <span className="err">{phoneErr}</span>}
          </div>
          <div className="frow">
            <label>Postnummer</label>
            <input required maxLength={4} value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="4000" />
            {zi && <div className="zone-tag">📦 {zi.label}</div>}
          </div>
          {err && <p style={{color:'var(--red)',fontSize:'.85rem'}}>{err}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'.5rem'}}>
            {loading ? 'Behandler...' : `Betal ${finalTotal.toFixed(0)} kr →`}
          </button>
        </form>

        <div className="panel">
          <h2>Ordresammendrag</h2>
          {cart.map(i => (
            <div className="si" key={i.product.id}>
              <span>{i.product.name} × {i.quantity}</span>
              <span>{(i.product.price * i.quantity).toFixed(0)} kr</span>
            </div>
          ))}
          <div className="si"><span>Subtotal</span><span>{sub.toFixed(0)} kr</span></div>
          {disc > 0 && <div className="si disc"><span>Rabatt 10%</span><span>−{disc.toFixed(0)} kr</span></div>}
          <div className="si"><span>Frakt</span><span>{zi ? zi.cost === 0 ? 'Gratis' : `${zi.cost} kr` : '–'}</span></div>
          <div className="si grand"><span>Total</span><span>{finalTotal.toFixed(0)} kr</span></div>
        </div>
      </div>
    </div>
  )
}

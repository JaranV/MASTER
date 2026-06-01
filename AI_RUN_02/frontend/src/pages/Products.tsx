import { useState, useEffect } from 'react'
import { fetchProducts } from '../api'
import { add, load } from '../cart'
import type { Product } from '../types'

const EMOJIS: Record<string,string> = {tshirt:'👕',hoodie:'🧥',cap:'🧢',sneakers:'👟',backpack:'🎒'}
function emoji(name: string) {
  const k = Object.keys(EMOJIS).find(k => name.toLowerCase().includes(k))
  return k ? EMOJIS[k] : '📦'
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [, forceUpdate] = useState(0)

  useEffect(() => { fetchProducts().then(setProducts) }, [])

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
  const cartCount = load().reduce((s, i) => s + i.quantity, 0)

  function handleAdd(p: Product) {
    add(p)
    window.dispatchEvent(new Event('cart-update'))
    forceUpdate(n => n + 1)
  }

  return (
    <div>
      <h1>Produkter</h1>
      <div className="search">
        <input placeholder="Søk etter produkter..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="grid">
        {filtered.map(p => (
          <div className="card" key={p.id}>
            <div className="card-img">{emoji(p.name)}</div>
            <div className="card-body">
              <div className="card-name">{p.name}</div>
              <div className="card-desc">{p.description}</div>
              <div className="card-foot">
                <span className="price">{p.price} kr</span>
                {p.stock > 0
                  ? <button className="btn-primary btn-sm" onClick={() => handleAdd(p)}>+ Legg til</button>
                  : <span className="oos">Utsolgt</span>
                }
              </div>
            </div>
          </div>
        ))}
      </div>
      {cartCount > 0 && (
        <div style={{position:'fixed',bottom:'1.5rem',right:'1.5rem'}}>
          <a href="/checkout">
            <button className="btn-primary" style={{padding:'.75rem 1.5rem',fontSize:'1rem',boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>
              Til kassen ({cartCount}) →
            </button>
          </a>
        </div>
      )}
    </div>
  )
}

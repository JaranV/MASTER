import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchOrder } from '../api'
import type { Order } from '../types'

export default function Confirmation() {
  const { id } = useParams<{id: string}>()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => { if (id) fetchOrder(id).then(setOrder) }, [id])

  if (!order) return <div className="conf"><p>Laster...</p></div>

  return (
    <div className="conf">
      <div className="tick">✅</div>
      <h1>Bestilling mottatt!</h1>
      <p>Takk, {order.name}. Du vil motta en bekreftelse på {order.email}.</p>
      <div className="ord-box panel">
        <h2>Ordre #{order.id}</h2>
        {order.items.map(i => (
          <div className="si" key={i.id}>
            <span>{i.product.name} × {i.quantity}</span>
            <span>{(i.price * i.quantity).toFixed(0)} kr</span>
          </div>
        ))}
        <div className="si"><span>Subtotal</span><span>{order.subtotal.toFixed(0)} kr</span></div>
        {order.discount > 0 && <div className="si disc"><span>Rabatt</span><span>−{order.discount.toFixed(0)} kr</span></div>}
        <div className="si"><span>Frakt</span><span>{order.shippingCost > 0 ? `${order.shippingCost} kr` : 'Gratis'}</span></div>
        <div className="si grand"><span>Total</span><span>{order.totalPrice.toFixed(0)} kr</span></div>
        <p style={{marginTop:'.75rem',fontSize:'.82rem',color:'var(--muted)'}}>
          Leveres til: {order.address}, {order.postalCode} {order.city}
        </p>
      </div>
      <Link to="/"><button className="btn-primary">← Fortsett å handle</button></Link>
    </div>
  )
}

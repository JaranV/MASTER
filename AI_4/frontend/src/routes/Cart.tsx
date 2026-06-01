import { Link } from 'react-router-dom'
import type { CartEntry } from '../types.ts'

function Cart({ cart, removeFromCart }: { cart: CartEntry[]; removeFromCart: (id: number) => void }) {
  if (cart.length === 0) {
    return (
      <div className="empty-msg">
        <p>Your cart is empty.</p>
        <br />
        <Link to="/" className="btn-primary">Browse products</Link>
      </div>
    )
  }

  let total = 0
  for (const entry of cart) {
    total += entry.product.price * entry.count
  }

  return (
    <div>
      <h2>Your Cart</h2>
      <br />
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map(entry => (
            <tr key={entry.product.id}>
              <td>{entry.product.name}</td>
              <td>{entry.count}</td>
              <td>{(entry.product.price * entry.count).toFixed(2)} kr</td>
              <td>
                <button className="remove-btn" onClick={() => removeFromCart(entry.product.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="cart-total"><strong>Total: {total.toFixed(2)} kr</strong></p>
      <Link to="/checkout" className="btn-primary">Go to Checkout</Link>
    </div>
  )
}

export default Cart

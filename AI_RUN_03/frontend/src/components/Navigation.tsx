import { NavLink } from 'react-router-dom'
import { useCart } from '../CartContext'

export function Navigation() {
  const { totalItems } = useCart()
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-brand">
        Webshop
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end>
          Products
        </NavLink>
        <NavLink to="/cart">
          Cart{totalItems > 0 ? ` (${totalItems})` : ''}
        </NavLink>
      </div>
    </nav>
  )
}

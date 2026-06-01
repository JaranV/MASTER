import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../cart';

export default function NavBar() {
  const { itemCount } = useCart();
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Webshop
      </Link>
      <nav>
        <NavLink to="/" end>
          Products
        </NavLink>
        <NavLink to="/cart">
          Cart{itemCount > 0 ? ` (${itemCount})` : ''}
        </NavLink>
      </nav>
    </header>
  );
}

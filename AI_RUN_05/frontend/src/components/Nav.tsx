import { Link, NavLink } from "react-router-dom";
import { useCart } from "../cart";

export function Nav() {
  const { totalQuantity } = useCart();
  return (
    <header className="nav">
      <Link to="/" className="brand">
        Webshop
      </Link>
      <nav>
        <NavLink to="/" end>
          Products
        </NavLink>
        <NavLink to="/cart">
          Cart{totalQuantity > 0 ? ` (${totalQuantity})` : ""}
        </NavLink>
      </nav>
    </header>
  );
}

import { NavLink } from "react-router-dom";
import { useCart } from "../CartContext";

export function Navbar() {
  const { count } = useCart();
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        Webshop
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/" end>
          Products
        </NavLink>
        <NavLink to="/cart">
          Cart {count > 0 ? `(${count})` : ""}
        </NavLink>
      </nav>
    </header>
  );
}

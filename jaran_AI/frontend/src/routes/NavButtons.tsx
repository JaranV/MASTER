import { useNavigate, useLocation, Outlet } from "react-router-dom";

function NavButtons() {

    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
            <nav>
                <h2>Routes</h2>
                {location.pathname !== "/products" && (
                    <button onClick={() => navigate("/products")}>
                        Products
                    </button>
                )}
                <button onClick={() => navigate("/checkout")}>
                    Checkout
                </button>
                <button onClick={() => navigate("/subscription")}>
                    Subscription
                </button>
                <button onClick={() => navigate("/cancel-subscription")}>
                    Cancel Subscription
                </button>
            </nav>
        </div>
    )

}

export default NavButtons

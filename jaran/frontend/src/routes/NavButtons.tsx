import { useNavigate, useLocation, Outlet } from "react-router-dom";

function NavButtons() {

    const navigate = useNavigate()
    const location = useLocation()

    const navigateToProducts = () => {
        navigate("/products")
    }

    const navigateToCheckout = () => {
        navigate("/checkout")
    }

    const navigateToSubscription = () => {
        navigate("/subscription")
    }

    const navigateToCancelSubscription = () => {
        navigate("/cancel-subscription")
    }

    const navigateToInvoices = () => {
        navigate("/invoice")
    }

    return (
        <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
            <nav>
                <h2>Routes</h2>
                {location.pathname !== "/products" && (
                    <button onClick={navigateToProducts}>
                        Products
                    </button>
                )}
                <button onClick={navigateToCheckout}>
                    Checkout
                </button>
                <button onClick={navigateToSubscription}>
                    Subscription
                </button>
                <button onClick={navigateToCancelSubscription}>
                    Cancel Subscription
                </button>
                <button onClick={navigateToInvoices}>
                    Invoices
                </button>
            </nav>
        </div>
    )

}

export default NavButtons

import React from "react";
import { Link } from "react-router-dom";

function OrderConfirmation() {
    return (
        <div className="confirmation">
            <h2>Thank you for your order!</h2>
            <p>Your payment was successful. We will process your order shortly.</p>
            <Link to="/">Back to shop</Link>
        </div>
    );
}

export default OrderConfirmation;

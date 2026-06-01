import React from "react";

function OrderConfirmation() {
    return (
        <div className="done-box">
            <h2>Thanks for your order!</h2>
            <p>We will send you an email with the details.</p>
            <br/>
            <a href="/">Back to shop</a>
        </div>
    );
}

export default OrderConfirmation;

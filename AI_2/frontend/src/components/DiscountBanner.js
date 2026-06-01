import React from 'react';

/**
 * Displays discount information in the checkout flow.
 * Shows subtotal, discount amount with description, and final total.
 */
function DiscountBanner({ subtotal, discount, total, hasDiscount }) {
    return (
        <div className="discount-summary">
            <div className="price-row">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} kr</span>
            </div>

            {hasDiscount && (
                <div className="price-row discount-row">
                    <span className="discount-label">
                        {discount.description}
                    </span>
                    <span className="discount-amount">
                        -{discount.amount.toFixed(2)} kr
                    </span>
                </div>
            )}

            <div className="price-row total-row">
                <span><strong>Total:</strong></span>
                <span><strong>{total.toFixed(2)} kr</strong></span>
            </div>
        </div>
    );
}

export default DiscountBanner;

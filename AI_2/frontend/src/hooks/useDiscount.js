import { useMemo } from 'react';

const DISCOUNT_RULES = [
    {
        id: 'threshold-10',
        description: '10% off orders over 500 kr',
        threshold: 500,
        percentage: 0.10,
        isApplicable: (subtotal) => subtotal > 500,
        calculate: (subtotal) => subtotal * 0.10,
    },
];

/**
 * Custom hook for calculating discounts on cart totals.
 * Returns the subtotal, discount details, and final total.
 *
 * @param {Array} cart - Array of cart items with product.price and count
 * @returns {Object} { subtotal, discount, total, hasDiscount }
 */
export function useDiscount(cart) {
    return useMemo(() => {
        const subtotal = cart.reduce(
            (sum, item) => sum + item.product.price * item.count,
            0
        );

        const applicableRule = DISCOUNT_RULES.find(rule => rule.isApplicable(subtotal));

        if (applicableRule) {
            const discountAmount = applicableRule.calculate(subtotal);
            return {
                subtotal,
                discount: {
                    amount: discountAmount,
                    description: applicableRule.description,
                    percentage: applicableRule.percentage,
                },
                total: subtotal - discountAmount,
                hasDiscount: true,
            };
        }

        return {
            subtotal,
            discount: { amount: 0, description: null, percentage: 0 },
            total: subtotal,
            hasDiscount: false,
        };
    }, [cart]);
}

package com.web_app.discount;

/**
 * Strategy interface for applying discounts to order totals.
 * Implementations define specific discount rules.
 */
public interface DiscountStrategy {

    /**
     * Determines whether this discount strategy applies to the given subtotal.
     *
     * @param subtotal the order subtotal before discounts
     * @return true if the discount should be applied
     */
    boolean isApplicable(double subtotal);

    /**
     * Calculates the discount amount for the given subtotal.
     *
     * @param subtotal the order subtotal before discounts
     * @return the discount amount to subtract
     */
    double calculateDiscount(double subtotal);

    /**
     * Returns a human-readable description of this discount.
     *
     * @return discount description
     */
    String getDescription();
}

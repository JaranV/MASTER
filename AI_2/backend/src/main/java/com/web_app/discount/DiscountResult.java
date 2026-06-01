package com.web_app.discount;

/**
 * Immutable value object representing the result of a discount calculation.
 * Contains the discount amount, a human-readable description, and whether
 * a discount was actually applied.
 */
public class DiscountResult {

    private final double discountAmount;
    private final String description;
    private final boolean applied;

    public DiscountResult(double discountAmount, String description, boolean applied) {
        this.discountAmount = discountAmount;
        this.description = description;
        this.applied = applied;
    }

    public static DiscountResult none() {
        return new DiscountResult(0.0, "No discount", false);
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public String getDescription() {
        return description;
    }

    public boolean isApplied() {
        return applied;
    }
}

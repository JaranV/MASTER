package com.web_app.discount;

/**
 * A discount strategy that applies a percentage discount when the
 * order subtotal exceeds a configurable threshold.
 *
 * Example: 10% off orders over 500 kr.
 */
public class ThresholdPercentageDiscount implements DiscountStrategy {

    private final double threshold;
    private final double percentage;
    private final String description;

    public ThresholdPercentageDiscount(double threshold, double percentage) {
        this.threshold = threshold;
        this.percentage = percentage;
        this.description = String.format("%.0f%% off orders over %.0f kr", percentage * 100, threshold);
    }

    @Override
    public boolean isApplicable(double subtotal) {
        return subtotal > threshold;
    }

    @Override
    public double calculateDiscount(double subtotal) {
        if (!isApplicable(subtotal)) {
            return 0.0;
        }
        return subtotal * percentage;
    }

    @Override
    public String getDescription() {
        return description;
    }
}

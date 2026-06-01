package com.web_app.discount;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for managing and applying discount strategies.
 * Supports multiple discount strategies that are evaluated in order.
 * Only the first applicable discount is applied (no stacking).
 */
@Service
public class DiscountService {

    private final List<DiscountStrategy> strategies;

    public DiscountService() {
        this.strategies = new ArrayList<>();
        // Register default discount strategies
        this.strategies.add(new ThresholdPercentageDiscount(500.0, 0.10));
    }

    /**
     * Applies the first matching discount strategy to the given subtotal.
     *
     * @param subtotal the order subtotal before discounts
     * @return a DiscountResult containing the discount amount and description
     */
    public DiscountResult applyDiscount(double subtotal) {
        for (DiscountStrategy strategy : strategies) {
            if (strategy.isApplicable(subtotal)) {
                double discountAmount = strategy.calculateDiscount(subtotal);
                return new DiscountResult(discountAmount, strategy.getDescription(), true);
            }
        }
        return DiscountResult.none();
    }

    /**
     * Calculates the final total after applying any applicable discounts.
     *
     * @param subtotal the order subtotal before discounts
     * @return the final total after discount
     */
    public double calculateFinalTotal(double subtotal) {
        DiscountResult result = applyDiscount(subtotal);
        return subtotal - result.getDiscountAmount();
    }
}

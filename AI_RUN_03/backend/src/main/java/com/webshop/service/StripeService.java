package com.webshop.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${CLIENT_BASE_URL:http://localhost:5173}")
    private String clientBaseUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Session createCheckoutSession(Order order) throws StripeException {
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientBaseUrl + "/confirmation/" + order.getId())
                .setCancelUrl(clientBaseUrl + "/cart")
                .setCustomerEmail(order.getEmail())
                .putMetadata("orderId", String.valueOf(order.getId()));

        double discountFactor = order.getSubtotal() > 0
                ? (order.getSubtotal() - order.getDiscount()) / order.getSubtotal()
                : 1.0;

        for (OrderItem item : order.getItems()) {
            long unitAmount = Math.round(item.getPrice() * discountFactor * 100);
            String name = order.getDiscount() > 0
                    ? item.getProduct().getName() + " (10% off)"
                    : item.getProduct().getName();
            builder.addLineItem(SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getQuantity())
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(unitAmount)
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(name)
                                    .build())
                            .build())
                    .build());
        }

        if (order.getShippingCost() > 0) {
            long shippingAmount = Math.round(order.getShippingCost() * 100);
            builder.addLineItem(SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(shippingAmount)
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Shipping (Zone " + order.getShippingZone() + ")")
                                    .build())
                            .build())
                    .build());
        }

        return Session.create(builder.build());
    }
}

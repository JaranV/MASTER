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
public class StripeCheckoutService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${CLIENT_BASE_URL:http://localhost:5173}")
    private String baseUrl;

    @PostConstruct
    void init() { Stripe.apiKey = secretKey; }

    public String createSessionUrl(Order order) throws StripeException {
        double discountFactor = order.getSubtotal() > 0
                ? (order.getSubtotal() - order.getDiscount()) / order.getSubtotal()
                : 1.0;

        var builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(baseUrl + "/confirmation/" + order.getId())
                .setCancelUrl(baseUrl + "/checkout")
                .setCustomerEmail(order.getEmail())
                .putMetadata("orderId", String.valueOf(order.getId()));

        for (OrderItem item : order.getItems()) {
            long cents = Math.round(item.getPrice() * discountFactor * 100);
            builder.addLineItem(SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getQuantity())
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(cents)
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(item.getProduct().getName()).build())
                            .build())
                    .build());
        }

        if (order.getShippingCost() > 0) {
            builder.addLineItem(SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(Math.round(order.getShippingCost() * 100))
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Shipping").build())
                            .build())
                    .build());
        }

        return Session.create(builder.build()).getUrl();
    }
}

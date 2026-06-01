package com.webshop.service;

import com.webshop.entity.Order;
import com.webshop.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public String createCheckoutSession(Order order) throws Exception {
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("http://localhost:3001/failure")
            .putMetadata("orderId", order.getId().toString());

        for (OrderItem item : order.getItems()) {
            builder.addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getCount())
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(Math.round(item.getPrice() * 100))
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(item.getProduct().getName())
                                    .build()
                            ).build()
                    ).build()
            );
        }

        Session session = Session.create(builder.build());
        return session.getUrl();
    }
}

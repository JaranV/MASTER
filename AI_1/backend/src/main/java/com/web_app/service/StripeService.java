package com.web_app.service;

import com.web_app.entity.Order;
import com.web_app.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String key;

    @PostConstruct
    public void init() {
        Stripe.apiKey = key;
    }

    public String createCheckoutSession(Order order) throws Exception {
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("http://localhost:3001/order-confirmation?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("http://localhost:3001/cart")
            .putMetadata("orderId", order.getId().toString());

        for (OrderItem orderLine : order.getItems()) {
            builder.addLineItem(buildLineItem(orderLine));
        }

        Session checkoutSession = Session.create(builder.build());
        return checkoutSession.getUrl();
    }

    private SessionCreateParams.LineItem buildLineItem(OrderItem orderLine) {
        long priceInOre = Math.round(orderLine.getPrice() * 100);

        return SessionCreateParams.LineItem.builder()
            .setQuantity((long) orderLine.getCount())
            .setPriceData(
                SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("nok")
                    .setUnitAmount(priceInOre)
                    .setProductData(
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(orderLine.getProduct().getName())
                            .build()
                    ).build()
            ).build();
    }

    public String getPaymentStatus(String sessionId) throws Exception {
        Session session = Session.retrieve(sessionId);
        return session.getPaymentStatus();
    }

}

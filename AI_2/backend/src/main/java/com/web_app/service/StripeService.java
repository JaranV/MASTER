package com.web_app.service;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.web_app.entity.Order;
import com.web_app.entity.OrderItem;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class StripeService {

    public String createCheckoutSession(Order order) throws Exception {
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            long amountInOre = Math.round(item.getPrice() * 100);

            lineItems.add(
                SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getCount())
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(amountInOre)
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(item.getProduct().getName())
                                    .build()
                            ).build()
                    ).build()
            );
        }

        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("http://localhost:3001/order-confirmation?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("http://localhost:3001/cart")
            .addAllLineItem(lineItems)
            .putMetadata("orderId", order.getId().toString())
            .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public String getPaymentStatus(String sessionId) throws Exception {
        Session session = Session.retrieve(sessionId);
        return session.getPaymentStatus();
    }
}

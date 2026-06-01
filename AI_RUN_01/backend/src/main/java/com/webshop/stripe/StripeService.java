package com.webshop.stripe;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.webshop.order.Order;
import com.webshop.order.OrderItem;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${CLIENT_BASE_URL:http://localhost:5173}")
    private String clientBaseUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public Session retrieveSession(String sessionId) throws StripeException {
        return Session.retrieve(sessionId);
    }

    public Session createCheckoutSession(Order order) throws StripeException {
        SessionCreateParams.Builder params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientBaseUrl + "/confirmation/" + order.getId())
                .setCancelUrl(clientBaseUrl + "/checkout")
                .setCustomerEmail(order.getEmail())
                .putMetadata("orderId", order.getId().toString());

        double subtotal = order.getSubtotal();
        double discount = order.getDiscount();
        double discountFactor = subtotal > 0 ? (subtotal - discount) / subtotal : 1.0;

        for (OrderItem item : order.getItems()) {
            double discountedUnitPrice = item.getPrice() * discountFactor;
            long unitAmount = Math.round(discountedUnitPrice * 100);

            params.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity((long) item.getQuantity())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("nok")
                                            .setUnitAmount(unitAmount)
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.getProduct().getName())
                                                            .build())
                                            .build())
                            .build());
        }

        if (order.getShippingCost() > 0) {
            params.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("nok")
                                            .setUnitAmount(Math.round(order.getShippingCost() * 100))
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Shipping (Zone " + order.getShippingZone() + ")")
                                                            .build())
                                            .build())
                            .build());
        }

        return Session.create(params.build());
    }
}

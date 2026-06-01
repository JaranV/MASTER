package com.webshop.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.success-url}")
    private String successUrlTemplate;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    private final OrderRepository orderRepository;

    public StripeService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    @Transactional
    public String createCheckoutSession(Order order) throws StripeException {
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        // Add product line items
        for (OrderItem item : order.getItems()) {
            lineItems.add(
                SessionCreateParams.LineItem.builder()
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(item.getUnitPrice().multiply(new BigDecimal("100")).longValue())
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(item.getProduct().getName())
                                    .build()
                            )
                            .build()
                    )
                    .setQuantity(item.getQuantity().longValue())
                    .build()
            );
        }

        // Add shipping as a line item
        if (order.getShippingCost().compareTo(BigDecimal.ZERO) > 0) {
            lineItems.add(
                SessionCreateParams.LineItem.builder()
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(order.getShippingCost().multiply(new BigDecimal("100")).longValue())
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Frakt (" + order.getPostalCode() + " " + order.getCity() + ")")
                                    .build()
                            )
                            .build()
                    )
                    .setQuantity(1L)
                    .build()
            );
        }

        // If there's a discount, add it as a negative adjustment line
        if (order.getDiscount() != null && order.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            lineItems.add(
                SessionCreateParams.LineItem.builder()
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(-order.getDiscount().multiply(new BigDecimal("100")).longValue())
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Rabatt 10% (over 500 kr)")
                                    .build()
                            )
                            .build()
                    )
                    .setQuantity(1L)
                    .build()
            );
        }

        String successUrl = successUrlTemplate.replace("{orderId}", order.getId().toString());

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setCustomerEmail(order.getEmail())
                .putMetadata("order_id", order.getId().toString())
                .addAllLineItem(lineItems)
                .build();

        Session session = Session.create(params);

        // Store the stripe session ID on the order
        order.setStripeSessionId(session.getId());
        orderRepository.save(order);

        return session.getUrl();
    }

    public Session retrieveSession(String sessionId) throws StripeException {
        return Session.retrieve(sessionId);
    }
}

package com.webshop.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Coupon;
import com.stripe.model.checkout.Session;
import com.stripe.param.CouponCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.webshop.exception.ApiException;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.model.OrderStatus;
import com.webshop.repository.OrderRepository;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${CLIENT_BASE_URL}")
    private String clientBaseUrl;

    private final OrderRepository orderRepository;

    public StripeService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public String createCheckoutSession(Order order) {
        try {
            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(clientBaseUrl + "/confirmation/" + order.getId())
                    .setCancelUrl(clientBaseUrl + "/checkout")
                    .setCustomerEmail(order.getEmail())
                    .putMetadata("orderId", String.valueOf(order.getId()));

            for (OrderItem item : order.getItems()) {
                paramsBuilder.addLineItem(buildLineItem(item.getProduct().getName(),
                        Math.round(item.getPrice() * 100), item.getQuantity()));
            }

            if (order.getShippingCost() > 0) {
                paramsBuilder.addLineItem(buildLineItem(
                        "Shipping (Zone " + order.getShippingZone() + ")",
                        Math.round(order.getShippingCost() * 100), 1));
            }

            if (order.getDiscount() > 0) {
                Coupon coupon = Coupon.create(CouponCreateParams.builder()
                        .setAmountOff(Math.round(order.getDiscount() * 100))
                        .setCurrency("nok")
                        .setDuration(CouponCreateParams.Duration.ONCE)
                        .setName("10% off (subtotal over 500 NOK)")
                        .build());
                paramsBuilder.addDiscount(SessionCreateParams.Discount.builder()
                        .setCoupon(coupon.getId())
                        .build());
            }

            Session session = Session.create(paramsBuilder.build());
            order.setStripeSessionId(session.getId());
            orderRepository.save(order);
            return session.getUrl();
        } catch (StripeException e) {
            throw new ApiException("Stripe error: " + e.getMessage());
        }
    }

    private SessionCreateParams.LineItem buildLineItem(String name, long unitAmountMinor, int quantity) {
        SessionCreateParams.LineItem.PriceData.ProductData productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                .setName(name)
                .build();
        SessionCreateParams.LineItem.PriceData priceData = SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("nok")
                .setUnitAmount(unitAmountMinor)
                .setProductData(productData)
                .build();
        return SessionCreateParams.LineItem.builder()
                .setPriceData(priceData)
                .setQuantity((long) quantity)
                .build();
    }

    public void markOrderPaid(String sessionId) {
        orderRepository.findByStripeSessionId(sessionId).ifPresent(order -> {
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
        });
    }
}

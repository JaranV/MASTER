package com.webshop.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.webshop.model.Order;
import com.webshop.model.OrderStatus;
import com.webshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private final OrderRepository orderRepository;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public StripeWebhookController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                @RequestHeader("Stripe-Signature") String signature) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Optional<StripeObject> deserialized = event.getDataObjectDeserializer().getObject();
            if (deserialized.isPresent() && deserialized.get() instanceof Session session) {
                Long orderId = null;
                if (session.getMetadata() != null && session.getMetadata().get("orderId") != null) {
                    try {
                        orderId = Long.parseLong(session.getMetadata().get("orderId"));
                    } catch (NumberFormatException ignored) {
                    }
                }
                Optional<Order> orderOpt = orderId != null
                        ? orderRepository.findById(orderId)
                        : orderRepository.findByStripeSessionId(session.getId());
                orderOpt.ifPresent(order -> {
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);
                });
            }
        }
        return ResponseEntity.ok("received");
    }
}

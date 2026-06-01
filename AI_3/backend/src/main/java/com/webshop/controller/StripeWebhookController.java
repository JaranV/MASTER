package com.webshop.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.webshop.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final OrderService orderService;

    public StripeWebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid signature"));
        } catch (Exception e) {
            log.error("Webhook parsing error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid payload"));
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);

            if (session != null) {
                String sessionId = session.getId();
                log.info("Checkout session completed: {}", sessionId);

                try {
                    orderService.markAsPaid(sessionId);
                    log.info("Order marked as paid for session: {}", sessionId);
                } catch (Exception e) {
                    log.error("Failed to mark order as paid: {}", e.getMessage());
                }
            }
        }

        return ResponseEntity.ok(Map.of("received", true));
    }
}

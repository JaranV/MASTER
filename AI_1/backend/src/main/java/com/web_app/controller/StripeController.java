package com.web_app.controller;

import com.web_app.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;

@RestController
@RequestMapping("/api/stripe")
public class StripeController {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final OrderService orderService;

    public StripeController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        Event stripeEvent;
        try {
            stripeEvent = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (Exception error) {
            System.err.println("Could not verify webhook: " + error.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if (!"checkout.session.completed".equals(stripeEvent.getType())) {
            return ResponseEntity.ok("Ignored");
        }

        try {
            handleCheckoutCompleted(stripeEvent);
        } catch (Exception error) {
            System.err.println("Failed to process checkout: " + error.getMessage());
            return ResponseEntity.badRequest().body("Processing error");
        }
        return ResponseEntity.ok("OK");
    }

    private void handleCheckoutCompleted(Event stripeEvent) throws EventDataObjectDeserializationException {
        Session checkoutSession = (Session) stripeEvent.getDataObjectDeserializer()
            .deserializeUnsafe();
        String orderId = checkoutSession.getMetadata().get("orderId");
        System.out.println("Payment done for order " + orderId);
        orderService.completeOrder(Integer.valueOf(orderId));
    }

}

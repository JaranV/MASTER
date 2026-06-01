package com.webshop.controller;

import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.webshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class WebhookController {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final OrderRepository orders;

    public WebhookController(OrderRepository orders) { this.orders = orders; }

    @PostMapping("/webhook")
    public ResponseEntity<String> handle(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sig) {
        try {
            var event = Webhook.constructEvent(payload, sig, webhookSecret);
            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    String orderId = session.getMetadata().get("orderId");
                    orders.findById(Long.parseLong(orderId)).ifPresent(o -> {
                        o.setStatus("PAID");
                        o.setStripeSessionId(session.getId());
                        orders.save(o);
                    });
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok("OK");
    }
}

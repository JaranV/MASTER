package com.webshop.stripe;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.webshop.order.Order;
import com.webshop.order.OrderRepository;
import com.webshop.order.OrderStatus;
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

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final OrderRepository orderRepository;

    public StripeWebhookController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                          @RequestHeader("Stripe-Signature") String signature) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Optional<Session> session = event.getDataObjectDeserializer().getObject()
                    .filter(o -> o instanceof Session)
                    .map(o -> (Session) o);

            session.ifPresent(s -> {
                String orderIdStr = s.getMetadata() != null ? s.getMetadata().get("orderId") : null;
                Optional<Order> order = orderIdStr != null
                        ? orderRepository.findById(Long.parseLong(orderIdStr))
                        : orderRepository.findByStripeSessionId(s.getId());
                order.ifPresent(o -> {
                    o.setStatus(OrderStatus.PAID);
                    orderRepository.save(o);
                });
            });
        }

        return ResponseEntity.ok("ok");
    }
}

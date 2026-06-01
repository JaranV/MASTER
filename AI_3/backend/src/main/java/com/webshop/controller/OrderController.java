package com.webshop.controller;

import com.webshop.dto.CreateOrderRequest;
import com.webshop.dto.OrderResponse;
import com.webshop.model.Order;
import com.webshop.service.OrderService;
import com.webshop.service.StripeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final StripeService stripeService;

    public OrderController(OrderService orderService, StripeService stripeService) {
        this.orderService = orderService;
        this.stripeService = stripeService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(OrderResponse.from(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            Order order = orderService.getOrder(id);
            return ResponseEntity.ok(OrderResponse.from(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> initiatePayment(@PathVariable Long id) {
        try {
            Order order = orderService.getOrder(id);
            if (order.getStatus() != Order.Status.PENDING) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order is not in PENDING state"));
            }
            String checkoutUrl = stripeService.createCheckoutSession(order);
            return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Payment initiation failed: " + e.getMessage()));
        }
    }
}

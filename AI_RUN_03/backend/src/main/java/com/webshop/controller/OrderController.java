package com.webshop.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.webshop.dto.CheckoutSessionResponse;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.model.Order;
import com.webshop.repository.OrderRepository;
import com.webshop.service.OrderService;
import com.webshop.service.StripeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final StripeService stripeService;

    public OrderController(OrderService orderService,
                           OrderRepository orderRepository,
                           StripeService stripeService) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.stripeService = stripeService;
    }

    @PostMapping
    public Order create(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) throws StripeException {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        Session session = stripeService.createCheckoutSession(order);
        order.setStripeSessionId(session.getId());
        orderRepository.save(order);
        return ResponseEntity.ok(new CheckoutSessionResponse(session.getUrl()));
    }
}

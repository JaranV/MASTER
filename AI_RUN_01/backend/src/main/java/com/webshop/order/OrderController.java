package com.webshop.order;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.webshop.order.dto.CreateOrderRequest;
import com.webshop.stripe.StripeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final StripeService stripeService;
    private final OrderRepository orderRepository;

    public OrderController(OrderService orderService, StripeService stripeService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.stripeService = stripeService;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public Order create(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) throws StripeException {
        Order order = orderService.getOrder(id);
        Session session = stripeService.createCheckoutSession(order);
        order.setStripeSessionId(session.getId());
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("url", session.getUrl()));
    }
}

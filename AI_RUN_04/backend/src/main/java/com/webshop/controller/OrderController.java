package com.webshop.controller;

import com.stripe.exception.StripeException;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.dto.PayResponse;
import com.webshop.model.Order;
import com.webshop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order create(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<PayResponse> pay(@PathVariable Long id) throws StripeException {
        String url = orderService.createCheckoutSession(id);
        return ResponseEntity.ok(new PayResponse(url));
    }
}

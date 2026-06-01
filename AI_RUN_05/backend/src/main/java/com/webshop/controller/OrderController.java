package com.webshop.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.webshop.dto.CheckoutSessionResponse;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.exception.ApiException;
import com.webshop.model.Order;
import com.webshop.repository.OrderRepository;
import com.webshop.service.OrderService;
import com.webshop.service.StripeService;

import jakarta.validation.Valid;

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

    @PostMapping("/{id}/pay")
    public CheckoutSessionResponse pay(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Order not found: " + id));
        String url = stripeService.createCheckoutSession(order);
        return new CheckoutSessionResponse(url);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Order not found: " + id));
    }
}

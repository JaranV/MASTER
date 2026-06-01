package com.webshop.controller;

import com.webshop.dto.CreateOrderRequest;
import com.webshop.entity.Order;
import com.webshop.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @PostMapping("/{id}/pay")
    public Map<String, String> pay(@PathVariable Integer id) {
        String url = orderService.getPaymentUrl(id);
        return Map.of("url", url);
    }
}

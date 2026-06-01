package com.web_app.controller;

import com.web_app.entity.Order;
import com.web_app.service.OrderService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3001")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order makeOrder(@RequestBody Map<String, Object> requestBody) {
        return orderService.createOrder(requestBody);
    }

    @PostMapping("/{id}/pay")
    public Map<String, String> pay(@PathVariable Integer id) {
        String paymentUrl = orderService.getPaymentUrl(id);
        return Map.of("url", paymentUrl);
    }

}

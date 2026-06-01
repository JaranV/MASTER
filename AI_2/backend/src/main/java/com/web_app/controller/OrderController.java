package com.web_app.controller;

import com.web_app.dto.CartItemDTO;
import com.web_app.dto.CreateOrderRequest;
import com.web_app.entity.Order;
import com.web_app.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request) {
        List<Map<String, Object>> items = request.getCartItems().stream()
                .map(this::convertCartItemToMap)
                .collect(Collectors.toList());

        return orderService.createOrder(
                request.getEmail(),
                request.getName(),
                request.getAddress(),
                request.getPhone(),
                items
        );
    }

    @PostMapping("/{id}/pay")
    public Map<String, String> initiatePayment(@PathVariable Integer id) {
        String url = orderService.initiatePayment(id);
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        return response;
    }

    private Map<String, Object> convertCartItemToMap(CartItemDTO item) {
        Map<String, Object> map = new HashMap<>();
        map.put("productid", item.getProductId());
        map.put("count", item.getCount());
        return map;
    }
}

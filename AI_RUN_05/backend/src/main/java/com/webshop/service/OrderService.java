package com.webshop.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webshop.dto.CartItemDto;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.dto.PostalCodeInfo;
import com.webshop.exception.ApiException;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.model.Product;
import com.webshop.repository.OrderRepository;
import com.webshop.repository.ProductRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PostalCodeService postalCodeService;

    public OrderService(OrderRepository orderRepository,
            ProductRepository productRepository,
            PostalCodeService postalCodeService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.postalCodeService = postalCodeService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        PostalCodeInfo postal = postalCodeService.lookup(request.getPostalCode())
                .orElseThrow(() -> new ApiException("Unknown postal code: " + request.getPostalCode()));

        List<CartItemDto> merged = mergeItems(request.getCartItems());

        Order order = new Order();
        order.setName(request.getName());
        order.setEmail(request.getEmail());
        order.setAddress(request.getAddress());
        order.setPhone(request.getPhone());
        order.setPostalCode(postal.getPostalCode());
        order.setCity(postal.getCity());
        order.setShippingZone(postal.getShippingZone());
        order.setShippingCost(postal.getShippingCost());

        double subtotal = 0.0;
        for (CartItemDto item : merged) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ApiException("Product not found: " + item.getProductId()));
            if (product.getStock() < item.getQuantity()) {
                throw new ApiException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(product, item.getQuantity(), product.getPrice());
            order.addItem(orderItem);
            subtotal += product.getPrice() * item.getQuantity();
        }

        double discount = subtotal > 500.0 ? round2(subtotal * 0.10) : 0.0;
        double total = round2(subtotal - discount + postal.getShippingCost());

        order.setSubtotal(round2(subtotal));
        order.setDiscount(discount);
        order.setTotalPrice(total);

        return orderRepository.save(order);
    }

    private List<CartItemDto> mergeItems(List<CartItemDto> items) {
        Map<Long, Integer> qtyByProduct = new HashMap<>();
        for (CartItemDto item : items) {
            qtyByProduct.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }
        List<CartItemDto> merged = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : qtyByProduct.entrySet()) {
            CartItemDto dto = new CartItemDto();
            dto.setProductId(entry.getKey());
            dto.setQuantity(entry.getValue());
            merged.add(dto);
        }
        return merged;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

package com.webshop.service;

import com.webshop.dto.CartItemDTO;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.entity.Order;
import com.webshop.entity.OrderItem;
import com.webshop.entity.Product;
import com.webshop.repository.OrderRepository;
import com.webshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StripeService stripeService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        StripeService stripeService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.stripeService = stripeService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setName(request.getName());
        order.setEmail(request.getEmail());
        order.setAddr(request.getAddress());
        order.setStatus("PENDING");
        order.setTime(LocalDateTime.now());

        double total = 0;

        for (CartItemDTO cartItem : request.getCartItems()) {
            Product product = productRepository.findById(cartItem.getProductid())
                .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProductid()));

            if (product.getStock() < cartItem.getCount()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getCount());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setCount(cartItem.getCount());
            item.setPrice(product.getPrice());
            order.getItems().add(item);

            total += product.getPrice() * cartItem.getCount();
        }

        order.setPrice(total);
        return orderRepository.save(order);
    }

    public String getPaymentUrl(Integer orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        try {
            return stripeService.createCheckoutSession(order);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment session", e);
        }
    }

    @Transactional
    public void markAsPaid(Integer orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus("PAID");
        orderRepository.save(order);
    }
}

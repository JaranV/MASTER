package com.web_app.service;

import com.web_app.discount.DiscountResult;
import com.web_app.discount.DiscountService;
import com.web_app.entity.Order;
import com.web_app.entity.OrderItem;
import com.web_app.entity.Product;
import com.web_app.exception.InsufficientStockException;
import com.web_app.exception.ResourceNotFoundException;
import com.web_app.repository.OrderRepository;
import com.web_app.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StripeService stripeService;
    private final DiscountService discountService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        StripeService stripeService,
                        DiscountService discountService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.stripeService = stripeService;
        this.discountService = discountService;
    }

    @Transactional
    public Order createOrder(String email, String name, String addr, String phone, List<Map<String, Object>> cartItems) {
        Order order = new Order();
        order.setEmail(email);
        order.setName(name);
        order.setAddr(addr);
        order.setPhone(phone);
        double total = 0;

        for (Map<String, Object> item : cartItems) {
            Integer productId = Integer.valueOf(item.get("productid").toString());
            Integer count = Integer.valueOf(item.get("count").toString());

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

            if (product.getStock() < count) {
                throw new InsufficientStockException("Not enough stock for: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setCount(count);
            orderItem.setPrice(product.getPrice());
            order.getItems().add(orderItem);

            total += product.getPrice() * count;

            product.setStock(product.getStock() - count);
            productRepository.save(product);
        }

        // Apply discount strategy
        DiscountResult discountResult = discountService.applyDiscount(total);
        double finalTotal = total - discountResult.getDiscountAmount();

        order.setPrice(finalTotal);
        return orderRepository.save(order);
    }

    public String initiatePayment(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        try {
            return stripeService.createCheckoutSession(order);
        } catch (Exception e) {
            throw new RuntimeException("Payment failed", e);
        }
    }

    @Transactional
    public void markAsPaid(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus("PAID");
        orderRepository.save(order);
    }

    public Order getOrder(Integer id) {
        return orderRepository.findById(id).orElse(null);
    }
}

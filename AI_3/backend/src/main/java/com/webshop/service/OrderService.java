package com.webshop.service;

import com.webshop.dto.CreateOrderRequest;
import com.webshop.dto.OrderResponse;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.model.Product;
import com.webshop.repository.OrderRepository;
import com.webshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class OrderService {

    private static final BigDecimal DISCOUNT_THRESHOLD = new BigDecimal("500");
    private static final BigDecimal DISCOUNT_RATE = new BigDecimal("0.10");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PostalCodeService postalCodeService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        PostalCodeService postalCodeService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.postalCodeService = postalCodeService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setEmail(request.getEmail());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setPostalCode(request.getPostalCode());

        String city = postalCodeService.lookupCity(request.getPostalCode());
        order.setCity(city != null ? city : "Ukjent");

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderRequest.CartItem cartItem : request.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + cartItem.getProductId()));

            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName() +
                        ". Available: " + product.getStock() + ", Requested: " + cartItem.getQuantity());
            }

            // Decrement stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(product, cartItem.getQuantity(), product.getPrice());
            order.addItem(orderItem);

            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setSubtotal(subtotal);

        // Calculate shipping
        BigDecimal shipping = postalCodeService.calculateShipping(request.getPostalCode());
        order.setShippingCost(shipping);

        // Calculate discount (10% if subtotal > 500 kr)
        BigDecimal discount = BigDecimal.ZERO;
        if (subtotal.compareTo(DISCOUNT_THRESHOLD) > 0) {
            discount = subtotal.multiply(DISCOUNT_RATE).setScale(2, RoundingMode.HALF_UP);
        }
        order.setDiscount(discount);

        // Total = subtotal - discount + shipping
        BigDecimal total = subtotal.subtract(discount).add(shipping);
        order.setTotal(total);

        return orderRepository.save(order);
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    public Order findByStripeSessionId(String sessionId) {
        return orderRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found for session: " + sessionId));
    }

    @Transactional
    public void markAsPaid(String stripeSessionId) {
        Order order = findByStripeSessionId(stripeSessionId);
        order.setStatus(Order.Status.PAID);
        orderRepository.save(order);
    }

    @Transactional
    public void setStripeSessionId(Long orderId, String sessionId) {
        Order order = getOrder(orderId);
        order.setStripeSessionId(sessionId);
        orderRepository.save(order);
    }
}

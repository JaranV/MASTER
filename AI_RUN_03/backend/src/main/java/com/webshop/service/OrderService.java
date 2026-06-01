package com.webshop.service;

import com.webshop.dto.CartItemRequest;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.model.OrderStatus;
import com.webshop.model.Product;
import com.webshop.repository.OrderRepository;
import com.webshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PostalCodeService postalCodeService;

    public OrderService(ProductRepository productRepository,
                        OrderRepository orderRepository,
                        PostalCodeService postalCodeService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.postalCodeService = postalCodeService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setName(request.getName());
        order.setEmail(request.getEmail());
        order.setAddress(request.getAddress());
        order.setPhone(request.getPhone());
        order.setPostalCode(request.getPostalCode());

        String city = postalCodeService.lookupCity(request.getPostalCode());
        if (city == null) {
            throw new IllegalArgumentException("Unknown postal code: " + request.getPostalCode());
        }
        order.setCity(city);

        int zone = postalCodeService.zoneFor(request.getPostalCode());
        order.setShippingZone(zone);
        order.setShippingCost(postalCodeService.shippingCostFor(zone));

        double subtotal = 0.0;
        for (CartItemRequest itemRequest : request.getCartItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + itemRequest.getProductId()));
            int quantity = itemRequest.getQuantity();
            if (product.getStock() < quantity) {
                throw new IllegalStateException(
                        "Insufficient stock for product " + product.getName());
            }
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPrice(product.getPrice());
            order.getItems().add(item);

            subtotal += product.getPrice() * quantity;
        }

        double discount = subtotal > 500.0 ? round2(subtotal * 0.10) : 0.0;
        double total = round2(subtotal - discount + order.getShippingCost());

        order.setSubtotal(round2(subtotal));
        order.setDiscount(discount);
        order.setTotalPrice(total);
        order.setStatus(OrderStatus.PENDING);

        return orderRepository.save(order);
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

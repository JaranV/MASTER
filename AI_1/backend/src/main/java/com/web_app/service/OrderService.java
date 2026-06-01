package com.web_app.service;

import com.web_app.entity.Order;
import com.web_app.entity.OrderItem;
import com.web_app.entity.Product;
import com.web_app.repository.OrderRepository;
import com.web_app.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings({"unchecked", "null"})
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final StripeService stripe;

    public OrderService(OrderRepository orderRepo,
        ProductRepository productRepo, StripeService stripe) {
            this.orderRepo = orderRepo;
            this.productRepo = productRepo;
            this.stripe = stripe;
        }


    @Transactional
    public Order createOrder(Map<String, Object> requestBody) {
        String phone = (String) requestBody.get("phone");
        validatePhone(phone);

        Order order = new Order();
        order.setName((String) requestBody.get("name"));
        order.setEmail((String) requestBody.get("email"));
        order.setAddress((String) requestBody.get("address"));
        order.setPhone(phone);

        List<Map<String, Object>> cartItems =
            (List<Map<String, Object>>) requestBody.get("cartItems");

        double total = 0;
        for (Map<String, Object> cartItem : cartItems) {
            Integer productId = Integer.valueOf(cartItem.get("productid").toString());
            Integer count = Integer.valueOf(cartItem.get("count").toString());

            Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            if (product.getStock() < count) {
                throw new RuntimeException("Not enough stock for: " + product.getName());
            }

            product.setStock(product.getStock() - count);
            productRepo.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setCount(count);
            item.setPrice(product.getPrice());
            order.getItems().add(item);

            total += product.getPrice() * count;
        }

        order.setTotalPrice(applyDiscount(total, 500, 0.9));
        return orderRepo.save(order);
    }

    private void validatePhone(String phone) {
        if (phone == null || !phone.matches("^[49]\\d{7}$")) {
            throw new RuntimeException("Invalid phone number");
        }
    }

    private double applyDiscount(double total, int discountThreshold, double percentage) {
        if (total > discountThreshold) {
            return total * percentage;
        }
        return total;
    }

    public String getPaymentUrl(Integer orderId) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        try {
            return stripe.createCheckoutSession(order);
        } catch (Exception error) {
            throw new RuntimeException("Payment failed", error);
        }
    }

    @Transactional
    public void completeOrder(Integer orderId) { //is this method used? or why is not this method in stripe? does it make more sense to have it her?
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus("PAID");
        orderRepo.save(order);
    }

    public Order getOrder(Integer id) {
        return orderRepo.findById(id).orElse(null);
    }

}

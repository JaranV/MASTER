package com.webshop.controller;

import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.model.Product;
import com.webshop.repository.OrderRepository;
import com.webshop.repository.ProductRepository;
import com.webshop.service.ShippingService;
import com.webshop.service.StripeCheckoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    record CartItemDto(Long productId, int quantity) {}
    record CreateOrderDto(String name, String email, String address,
                          String phone, String postalCode, List<CartItemDto> cartItems) {}

    private final OrderRepository orders;
    private final ProductRepository products;
    private final ShippingService shipping;
    private final StripeCheckoutService stripe;

    public OrderController(OrderRepository orders, ProductRepository products,
                           ShippingService shipping, StripeCheckoutService stripe) {
        this.orders = orders;
        this.products = products;
        this.shipping = shipping;
        this.stripe = stripe;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderDto dto) {
        List<OrderItem> items = new ArrayList<>();
        double subtotal = 0;

        for (CartItemDto ci : dto.cartItems()) {
            Product p = products.findById(ci.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));
            if (p.getStock() < ci.quantity())
                return ResponseEntity.badRequest().body(Map.of("error", "Out of stock: " + p.getName()));
            try {
                p.setStock(p.getStock() - ci.quantity());
                products.save(p);
            } catch (ObjectOptimisticLockingFailureException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Stock changed, please retry"));
            }
            OrderItem item = new OrderItem();
            item.setProduct(p);
            item.setQuantity(ci.quantity());
            item.setPrice(p.getPrice());
            items.add(item);
            subtotal += p.getPrice() * ci.quantity();
        }

        double discount = subtotal > 500 ? subtotal * 0.10 : 0;
        int zone = shipping.zone(dto.postalCode());
        double shipCost = shipping.cost(zone);

        Order order = new Order();
        order.setEmail(dto.email());
        order.setName(dto.name());
        order.setAddress(dto.address());
        order.setPhone(dto.phone());
        order.setPostalCode(dto.postalCode());
        order.setCity(shipping.city(dto.postalCode()));
        order.setShippingZone(zone);
        order.setShippingCost(shipCost);
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setTotalPrice(subtotal - discount + shipCost);
        order = orders.save(order);

        for (OrderItem item : items) item.setOrder(order);
        order.setItems(items);
        return ResponseEntity.ok(orders.save(order));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) {
        return orders.findById(id).map(order -> {
            try {
                return ResponseEntity.ok(Map.of("url", stripe.createSessionUrl(order)));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().<Object>body(Map.of("error", e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable Long id) {
        return orders.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}

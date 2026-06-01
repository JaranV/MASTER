package com.webshop.order;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.webshop.order.dto.CartItemDto;
import com.webshop.order.dto.CreateOrderRequest;
import com.webshop.product.Product;
import com.webshop.product.ProductRepository;
import com.webshop.shipping.PostalCodeService;
import com.webshop.shipping.ShippingInfo;
import com.webshop.stripe.StripeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final double DISCOUNT_THRESHOLD = 500.0;
    private static final double DISCOUNT_RATE = 0.10;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PostalCodeService postalCodeService;
    private final StripeService stripeService;

    public OrderService(ProductRepository productRepository,
                        OrderRepository orderRepository,
                        PostalCodeService postalCodeService,
                        StripeService stripeService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.postalCodeService = postalCodeService;
        this.stripeService = stripeService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest req) {
        ShippingInfo shipping = postalCodeService.lookup(req.getPostalCode());

        Order order = new Order();
        order.setName(req.getName());
        order.setEmail(req.getEmail());
        order.setAddress(req.getAddress());
        order.setPhone(req.getPhone());
        order.setPostalCode(req.getPostalCode());
        order.setCity(shipping.city());
        order.setShippingZone(shipping.zone());
        order.setShippingCost(shipping.cost());

        double subtotal = 0.0;

        for (CartItemDto ci : req.getCartItems()) {
            Product product = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + ci.getProductId()));
            if (product.getStock() < ci.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - ci.getQuantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(ci.getQuantity());
            item.setPrice(product.getPrice());
            order.addItem(item);

            subtotal += product.getPrice() * ci.getQuantity();
        }

        double discount = subtotal > DISCOUNT_THRESHOLD ? round2(subtotal * DISCOUNT_RATE) : 0.0;
        double total = round2(subtotal - discount + shipping.cost());

        order.setSubtotal(round2(subtotal));
        order.setDiscount(discount);
        order.setTotalPrice(total);

        return orderRepository.save(order);
    }

    public Order getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        return syncStatusFromStripe(order);
    }

    @Transactional
    protected Order syncStatusFromStripe(Order order) {
        if (order.getStatus() != OrderStatus.PENDING || order.getStripeSessionId() == null) {
            return order;
        }
        try {
            Session session = stripeService.retrieveSession(order.getStripeSessionId());
            if ("paid".equalsIgnoreCase(session.getPaymentStatus())
                    || "complete".equalsIgnoreCase(session.getStatus())) {
                order.setStatus(OrderStatus.PAID);
                return orderRepository.save(order);
            }
        } catch (StripeException e) {
            log.warn("Could not sync Stripe status for order {}: {}", order.getId(), e.getMessage());
        }
        return order;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}

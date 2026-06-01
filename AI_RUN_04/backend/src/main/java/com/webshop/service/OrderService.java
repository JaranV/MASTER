package com.webshop.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Coupon;
import com.stripe.model.checkout.Session;
import com.stripe.param.CouponCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.webshop.dto.CartItemDto;
import com.webshop.dto.CreateOrderRequest;
import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import com.webshop.model.OrderStatus;
import com.webshop.model.Product;
import com.webshop.repository.OrderRepository;
import com.webshop.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PostalCodeService postalCodeService;

    private final String stripeSecretKey;
    private final String clientBaseUrl;

    public OrderService(ProductRepository productRepository,
                        OrderRepository orderRepository,
                        PostalCodeService postalCodeService,
                        @Value("${stripe.secret-key}") String stripeSecretKey,
                        @Value("${CLIENT_BASE_URL:http://localhost:5173}") String clientBaseUrl) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.postalCodeService = postalCodeService;
        this.stripeSecretKey = stripeSecretKey;
        this.clientBaseUrl = clientBaseUrl;
    }

    @PostConstruct
    void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        ShippingInfo shipping = postalCodeService.resolve(request.getPostalCode());

        Order order = new Order();
        order.setName(request.getName());
        order.setEmail(request.getEmail());
        order.setAddress(request.getAddress());
        order.setPhone(request.getPhone());
        order.setPostalCode(request.getPostalCode());
        order.setCity(shipping.getCity());
        order.setShippingZone(shipping.getZone());
        order.setShippingCost(shipping.getCost());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        double subtotal = 0.0;
        for (CartItemDto cartItem : request.getCartItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + cartItem.getProductId()));
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(product, cartItem.getQuantity(), product.getPrice());
            order.addItem(orderItem);
            subtotal += product.getPrice() * cartItem.getQuantity();
        }

        double discount = subtotal > 500.0 ? round2(subtotal * 0.10) : 0.0;
        double total = round2(subtotal - discount + shipping.getCost());

        order.setSubtotal(round2(subtotal));
        order.setDiscount(discount);
        order.setTotalPrice(total);

        return orderRepository.save(order);
    }

    @Transactional
    public String createCheckoutSession(Long orderId) throws StripeException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            lineItems.add(SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getQuantity())
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(toMinorUnits(item.getPrice()))
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(item.getProduct().getName())
                                    .setDescription(item.getProduct().getDescription())
                                    .build())
                            .build())
                    .build());
        }

        if (order.getShippingCost() > 0) {
            lineItems.add(SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("nok")
                            .setUnitAmount(toMinorUnits(order.getShippingCost()))
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Shipping (Zone " + order.getShippingZone() + ")")
                                    .build())
                            .build())
                    .build());
        }

        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientBaseUrl + "/confirmation/" + order.getId())
                .setCancelUrl(clientBaseUrl + "/checkout")
                .setCustomerEmail(order.getEmail())
                .putMetadata("orderId", order.getId().toString());

        for (SessionCreateParams.LineItem li : lineItems) {
            builder.addLineItem(li);
        }

        if (order.getDiscount() > 0) {
            Coupon coupon = Coupon.create(CouponCreateParams.builder()
                    .setAmountOff(toMinorUnits(order.getDiscount()))
                    .setCurrency("nok")
                    .setDuration(CouponCreateParams.Duration.ONCE)
                    .setName("Order discount")
                    .build());
            builder.addDiscount(SessionCreateParams.Discount.builder()
                    .setCoupon(coupon.getId())
                    .build());
        }

        Session session = Session.create(builder.build());
        order.setStripeSessionId(session.getId());
        orderRepository.save(order);
        return session.getUrl();
    }

    @Transactional
    public void markPaidBySessionId(String sessionId) {
        orderRepository.findByStripeSessionId(sessionId).ifPresent(order -> {
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
        });
    }

    @Transactional(readOnly = true)
    public Order findById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        order.getItems().size();
        return order;
    }

    private static long toMinorUnits(double amount) {
        return Math.round(amount * 100.0);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}

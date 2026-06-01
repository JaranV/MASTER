package com.webshop.Controller;

import com.webshop.DTO.*;
import com.webshop.Entity.*;
import com.webshop.Repository.*;
import com.webshop.Utils.*;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.SubscriptionCancelParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin
public class PaymentController {

    @Value("${stripe.secret-key}")
    String STRIPE_API_KEY;

    @Value("${CLIENT_BASE_URL}")
    String clientBaseURL;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    // Hosted checkout for one-time payments
    // Creates a Stripe Checkout Session and returns the URL to redirect to
    @PostMapping("/checkout/hosted")
    String hostedCheckout(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Find or create customer in Stripe
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Save customer to our DB if not already there
        CustomerEntity dbCustomer = customerRepository.findByStripeCustomerId(customer.getId());
        if (dbCustomer == null) {
            dbCustomer = new CustomerEntity();
            dbCustomer.setStripeCustomerId(customer.getId());
            dbCustomer.setEmail(requestDTO.getCustomerEmail());
            dbCustomer.setName(requestDTO.getCustomerName());
            customerRepository.save(dbCustomer);
        }

        // Create order in our DB with status PENDING
        OrderEntity order = new OrderEntity();
        order.setEmail(requestDTO.getCustomerEmail());
        order.setName(requestDTO.getCustomerName());
        order.setStatus("PENDING");
        order.setTime(LocalDateTime.now());

        // Calculate total price and save order first to get the ID
        double totalPrice = 0;
        for (CartItemDTO item : requestDTO.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId()).orElseThrow();
            totalPrice += product.getPrice() * item.getCount();
        }
        order.setPrice(totalPrice);
        orderRepository.save(order);

        // Save order items
        for (CartItemDTO item : requestDTO.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId()).orElseThrow();
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setCount(item.getCount());
            orderItem.setPrice(product.getPrice());
            orderItemRepository.save(orderItem);
        }

        // Build the Stripe Checkout Session
        SessionCreateParams.Builder paramsBuilder =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setCustomer(customer.getId())
                        .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(clientBaseURL + "/failure")
                        .putMetadata("order_id", String.valueOf(order.getId()));

        // Add each cart item as a line item
        for (CartItemDTO item : requestDTO.getItems()) {
            ProductEntity product = productRepository.findById(item.getProductId()).orElseThrow();

            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity((long) item.getCount())
                            .setPriceData(
                                    PriceData.builder()
                                            .setProductData(
                                                    PriceData.ProductData.builder()
                                                            .setName(product.getName())
                                                            .build()
                                            )
                                            .setCurrency("usd")
                                            .setUnitAmount((long) (product.getPrice() * 100))
                                            .build())
                            .build());
        }

        Session session = Session.create(paramsBuilder.build());

        return session.getUrl();
    }

    // Hosted checkout for subscriptions
    // Creates a Stripe Checkout Session in subscription mode and returns the URL
    @PostMapping("/subscriptions/hosted")
    String hostedSubscription(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Find or create customer in Stripe
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Save customer to our DB if not already there
        CustomerEntity dbCustomer = customerRepository.findByStripeCustomerId(customer.getId());
        if (dbCustomer == null) {
            dbCustomer = new CustomerEntity();
            dbCustomer.setStripeCustomerId(customer.getId());
            dbCustomer.setEmail(requestDTO.getCustomerEmail());
            dbCustomer.setName(requestDTO.getCustomerName());
            customerRepository.save(dbCustomer);
        }

        // Build the Stripe Checkout Session for subscription
        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                        .setCustomer(customer.getId())
                        .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(clientBaseURL + "/failure")
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPrice(requestDTO.getPriceId())
                                        .build()
                        )
                        .build();

        Session session = Session.create(params);

        return session.getUrl();
    }

    // List all subscriptions for a customer by email
    @PostMapping("/subscriptions/list")
    List<SubscriptionEntity> listSubscriptions(@RequestBody RequestDTO requestDTO) {
        return subscriptionRepository.findByCustomerEmail(requestDTO.getCustomerEmail());
    }

    // Cancel a subscription by its Stripe subscription ID
    @PostMapping("/subscriptions/cancel")
    String cancelSubscription(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Cancel the subscription in Stripe
        Subscription subscription = Subscription.retrieve(requestDTO.getSubscriptionId());
        subscription.cancel();

        // Update our DB (webhook will also do this, but update immediately for responsiveness)
        SubscriptionEntity dbSubscription = subscriptionRepository.findByStripeSubscriptionId(requestDTO.getSubscriptionId());
        if (dbSubscription != null) {
            dbSubscription.setStatus("canceled");
            subscriptionRepository.save(dbSubscription);
        }

        return "Subscription cancelled";
    }
}

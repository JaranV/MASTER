package com.webshop.Controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.webshop.Entity.*;
import com.webshop.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@RestController
public class WebhookController {

    @Value("${stripe.secret-key}")
    String STRIPE_API_KEY;

    @Value("${stripe.webhook-secret}")
    String webhookSecret;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @PostMapping("/stripe/webhook")
    ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {

        Stripe.apiKey = STRIPE_API_KEY;

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Handle checkout.session.completed — covers both payments and subscriptions
        if ("checkout.session.completed".equals(event.getType())) {
            handleCheckoutSessionCompleted(event);
        }

        // Handle subscription updates from Stripe
        if ("customer.subscription.updated".equals(event.getType())) {
            handleSubscriptionUpdated(event);
        }

        // Handle subscription deletions (cancellations)
        if ("customer.subscription.deleted".equals(event.getType())) {
            handleSubscriptionDeleted(event);
        }

        return ResponseEntity.ok("OK");
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null) return;

        // Save customer to our DB if not already there
        saveCustomerFromStripe(session.getCustomer(), session.getCustomerEmail());

        // Handle one-time payment — update order status to PAID
        if ("payment".equals(session.getMode())) {
            String orderId = session.getMetadata().get("order_id");
            if (orderId != null) {
                OrderEntity order = orderRepository.findById(Long.parseLong(orderId)).orElse(null);
                if (order != null) {
                    order.setStatus("PAID");
                    orderRepository.save(order);
                }
            }
        }

        // Handle subscription — save the subscription to our DB
        if ("subscription".equals(session.getMode())) {
            String stripeSubscriptionId = session.getSubscription();
            if (stripeSubscriptionId != null) {
                try {
                    com.stripe.model.Subscription stripeSubscription =
                            com.stripe.model.Subscription.retrieve(stripeSubscriptionId);
                    saveSubscription(stripeSubscription, session.getCustomerEmail());
                } catch (StripeException e) {
                    System.out.println("Error retrieving subscription: " + e.getMessage());
                }
            }
        }
    }

    private void handleSubscriptionUpdated(Event event) {
        com.stripe.model.Subscription stripeSubscription =
                (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (stripeSubscription == null) return;

        SubscriptionEntity dbSubscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId());
        if (dbSubscription != null) {
            dbSubscription.setStatus(stripeSubscription.getStatus());
            com.google.gson.JsonObject rawSub = stripeSubscription.getRawJsonObject();
            if (rawSub.has("current_period_end") && !rawSub.get("current_period_end").isJsonNull()) {
                dbSubscription.setCurrentPeriodEnd(toLocalDateTime(rawSub.get("current_period_end").getAsLong()));
            }
            if (rawSub.has("trial_end") && !rawSub.get("trial_end").isJsonNull()) {
                dbSubscription.setTrialEnd(toLocalDateTime(rawSub.get("trial_end").getAsLong()));
            }
            subscriptionRepository.save(dbSubscription);
        }
    }

    private void handleSubscriptionDeleted(Event event) {
        com.stripe.model.Subscription stripeSubscription =
                (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (stripeSubscription == null) return;

        SubscriptionEntity dbSubscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId());
        if (dbSubscription != null) {
            dbSubscription.setStatus("canceled");
            subscriptionRepository.save(dbSubscription);
        }
    }

    private void saveCustomerFromStripe(String stripeCustomerId, String email) {
        if (stripeCustomerId == null) return;

        CustomerEntity existing = customerRepository.findByStripeCustomerId(stripeCustomerId);
        if (existing == null) {
            CustomerEntity customer = new CustomerEntity();
            customer.setStripeCustomerId(stripeCustomerId);
            customer.setEmail(email);
            // Try to get the name from Stripe
            try {
                com.stripe.model.Customer stripeCustomer = com.stripe.model.Customer.retrieve(stripeCustomerId);
                customer.setName(stripeCustomer.getName());
            } catch (StripeException e) {
                System.out.println("Error retrieving customer: " + e.getMessage());
            }
            customerRepository.save(customer);
        }
    }

    private void saveSubscription(com.stripe.model.Subscription stripeSubscription, String customerEmail) {
        SubscriptionEntity existing = subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.getId());

        SubscriptionEntity dbSubscription = (existing != null) ? existing : new SubscriptionEntity();
        dbSubscription.setStripeSubscriptionId(stripeSubscription.getId());
        dbSubscription.setStripeCustomerId(stripeSubscription.getCustomer());
        dbSubscription.setCustomerEmail(customerEmail);
        dbSubscription.setStatus(stripeSubscription.getStatus());
        com.google.gson.JsonObject rawSubJson = stripeSubscription.getRawJsonObject();
        if (rawSubJson.has("current_period_end") && !rawSubJson.get("current_period_end").isJsonNull()) {
            dbSubscription.setCurrentPeriodEnd(toLocalDateTime(rawSubJson.get("current_period_end").getAsLong()));
        }
        if (rawSubJson.has("start_date") && !rawSubJson.get("start_date").isJsonNull()) {
            dbSubscription.setStartDate(toLocalDateTime(rawSubJson.get("start_date").getAsLong()));
        }

        if (rawSubJson.has("trial_end") && !rawSubJson.get("trial_end").isJsonNull()) {
            dbSubscription.setTrialEnd(toLocalDateTime(rawSubJson.get("trial_end").getAsLong()));
        }

        // Get the price ID from the first subscription item
        if (stripeSubscription.getItems() != null && !stripeSubscription.getItems().getData().isEmpty()) {
            dbSubscription.setStripePriceId(
                    stripeSubscription.getItems().getData().get(0).getPrice().getId()
            );
        }

        subscriptionRepository.save(dbSubscription);
    }

    // Convert Unix timestamp (seconds) to LocalDateTime
    private LocalDateTime toLocalDateTime(Long epochSeconds) {
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneId.systemDefault());
    }
}

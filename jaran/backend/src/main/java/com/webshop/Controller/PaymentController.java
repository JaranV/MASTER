package com.webshop.Controller;

import com.webshop.DAO.*;
import com.webshop.DTO.*;
import com.webshop.Utils.*;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Product;
import com.stripe.model.Subscription;
//import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SubscriptionCreateParams;
//import com.stripe.param.checkout.SessionCreateParams;
//import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.context.request.WebRequest;

@RestController
@CrossOrigin //oppdater denne senere UPDATE
public class PaymentController {

    @Value("${stripe.secret-key}")
    String STRIPE_API_KEY;

    @Value("${CLIENT_BASE_URL}")
    String clientBaseURL;

    @PostMapping("/checkout")
    String integratedCheckout(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());
        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                       .setAmount(Long.parseLong(calculateOrderAmount(requestDTO.getItems())))
                        .setCurrency("usd")
                        .setCustomer(customer.getId())
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods
                                        .builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return paymentIntent.getClientSecret();
    }

    static String calculateOrderAmount(Product[] items) {
        long total = 0L;

        for (Product item: items) {
            // Look up the application database to find the prices for the products in the given list
            total += ProductDAO.getProduct(item.getId()).getDefaultPriceObject().getUnitAmountDecimal().floatValue();
        }
        return String.valueOf(total);
    }

    @PostMapping("/subscriptions/new")
    String newSubscription(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Start by finding existing customer record from Stripe or creating a new one if needed
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Create a subscription with status "incomplete" — waits for payment confirmation from frontend
        SubscriptionCreateParams params = SubscriptionCreateParams.builder()
                .setCustomer(customer.getId())
                .addItem(SubscriptionCreateParams.Item.builder()
                        // Price ID from Stripe Dashboard (recurring monthly product)
                        .setPrice(requestDTO.getPriceId())
                        .build())
                .setTrialPeriodDays(30L) // check on this later UPDATE 
                .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
                .addExpand("latest_invoice.payment_intent")
                .build();

        Subscription subscription = Subscription.create(params);

        // Access client secret via raw JSON — SDK 31 removed getPaymentIntentObject()
        Invoice latestInvoice = subscription.getLatestInvoiceObject();
        return latestInvoice.getRawJsonObject()
                .getAsJsonObject("payment_intent")
                .get("client_secret")
                .getAsString();
    }

//    @PostMapping("/checkout/hosted")
//    String hostedCheckout(@RequestBody RequestDTO requestDTO) throws StripeException {
//
//        Stripe.apiKey = STRIPE_API_KEY;
//
//        // Start by finding an existing customer record from Stripe or creating a new one if needed
//        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());
//
//        // Next, create a checkout session by adding the details of the checkout
//        SessionCreateParams.Builder paramsBuilder =
//                SessionCreateParams.builder()
//                        .setMode(SessionCreateParams.Mode.PAYMENT)
//                        .setCustomer(customer.getId())
//                        .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
//                        .setCancelUrl(clientBaseURL + "/failure");
//
//        for (Product product : requestDTO.getItems()) {
//            paramsBuilder.addLineItem(
//                    SessionCreateParams.LineItem.builder()
//                            .setQuantity(1L)
//                            .setPriceData(
//                                    PriceData.builder()
//                                            .setProductData(
//                                                    PriceData.ProductData.builder()
//                                                            .putMetadata("app_id", product.getId())
//                                                            .setName(product.getName())
//                                                            .build()
//                                            )
//                                            .setCurrency(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getCurrency())
//                                            .setUnitAmountDecimal(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getUnitAmountDecimal())
//                                            .build())
//                            .build());
//
//        }
//
//        Session session = Session.create(paramsBuilder.build());
//
//        return session.getUrl();
//    }

}
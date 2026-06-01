package com.webshop.DTO;

//data transfer object
public class RequestDTO {
    private CartItemDTO[] items;
    private String customerName;
    private String customerEmail;
    private String priceId;
    private String subscriptionId;

    public CartItemDTO[] getItems() {
        return items;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getPriceId() {
        return priceId;
    }

    public String getSubscriptionId() {
        return subscriptionId;
    }
}

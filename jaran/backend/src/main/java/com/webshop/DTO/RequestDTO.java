package com.webshop.DTO;

import com.stripe.model.Product;

//data transfer object
public class RequestDTO {
    Product[] items;
    String customerName;
    String customerEmail;
    String priceId;

    public Product[] getItems() {
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

}
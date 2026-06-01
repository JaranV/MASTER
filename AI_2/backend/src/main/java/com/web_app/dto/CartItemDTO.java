package com.web_app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CartItemDTO {

    @JsonProperty("productid")
    private Integer productId;

    @JsonProperty("count")
    private Integer count;

    public CartItemDTO() {
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}

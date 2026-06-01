package com.webshop.dto;

import com.webshop.model.Order;
import com.webshop.model.OrderItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Long id;
    private String customerName;
    private String email;
    private String phone;
    private String address;
    private String postalCode;
    private String city;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal discount;
    private BigDecimal total;
    private String status;
    private LocalDateTime createdAt;
    private List<ItemResponse> items;

    public static OrderResponse from(Order order) {
        OrderResponse r = new OrderResponse();
        r.id = order.getId();
        r.customerName = order.getCustomerName();
        r.email = order.getEmail();
        r.phone = order.getPhone();
        r.address = order.getAddress();
        r.postalCode = order.getPostalCode();
        r.city = order.getCity();
        r.subtotal = order.getSubtotal();
        r.shippingCost = order.getShippingCost();
        r.discount = order.getDiscount();
        r.total = order.getTotal();
        r.status = order.getStatus().name();
        r.createdAt = order.getCreatedAt();
        r.items = order.getItems().stream().map(ItemResponse::from).toList();
        return r;
    }

    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getPostalCode() { return postalCode; }
    public String getCity() { return city; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public BigDecimal getDiscount() { return discount; }
    public BigDecimal getTotal() { return total; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<ItemResponse> getItems() { return items; }

    public static class ItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;

        public static ItemResponse from(OrderItem item) {
            ItemResponse r = new ItemResponse();
            r.productId = item.getProduct().getId();
            r.productName = item.getProduct().getName();
            r.quantity = item.getQuantity();
            r.unitPrice = item.getUnitPrice();
            r.lineTotal = item.getLineTotal();
            return r;
        }

        public Long getProductId() { return productId; }
        public String getProductName() { return productName; }
        public Integer getQuantity() { return quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public BigDecimal getLineTotal() { return lineTotal; }
    }
}

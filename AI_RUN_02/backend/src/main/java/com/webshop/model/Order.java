package com.webshop.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String email, name, address, phone, postalCode, city;
    private int shippingZone;
    private double shippingCost, subtotal, discount, totalPrice;
    private String status = "PENDING";
    private String stripeSessionId;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getPostalCode() { return postalCode; }
    public String getCity() { return city; }
    public int getShippingZone() { return shippingZone; }
    public double getShippingCost() { return shippingCost; }
    public double getSubtotal() { return subtotal; }
    public double getDiscount() { return discount; }
    public double getTotalPrice() { return totalPrice; }
    public String getStatus() { return status; }
    public String getStripeSessionId() { return stripeSessionId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
    public void setId(Long id) { this.id = id; }
    public void setEmail(String v) { email = v; }
    public void setName(String v) { name = v; }
    public void setAddress(String v) { address = v; }
    public void setPhone(String v) { phone = v; }
    public void setPostalCode(String v) { postalCode = v; }
    public void setCity(String v) { city = v; }
    public void setShippingZone(int v) { shippingZone = v; }
    public void setShippingCost(double v) { shippingCost = v; }
    public void setSubtotal(double v) { subtotal = v; }
    public void setDiscount(double v) { discount = v; }
    public void setTotalPrice(double v) { totalPrice = v; }
    public void setStatus(String v) { status = v; }
    public void setStripeSessionId(String v) { stripeSessionId = v; }
    public void setItems(List<OrderItem> v) { items = v; }
}

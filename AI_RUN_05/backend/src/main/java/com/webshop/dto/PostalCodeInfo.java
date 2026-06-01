package com.webshop.dto;

public class PostalCodeInfo {

    private String postalCode;
    private String city;
    private int shippingZone;
    private double shippingCost;

    public PostalCodeInfo() {
    }

    public PostalCodeInfo(String postalCode, String city, int shippingZone, double shippingCost) {
        this.postalCode = postalCode;
        this.city = city;
        this.shippingZone = shippingZone;
        this.shippingCost = shippingCost;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public int getShippingZone() {
        return shippingZone;
    }

    public void setShippingZone(int shippingZone) {
        this.shippingZone = shippingZone;
    }

    public double getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(double shippingCost) {
        this.shippingCost = shippingCost;
    }
}

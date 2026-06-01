package com.webshop.service;

public class ShippingInfo {

    private final String city;
    private final int zone;
    private final double cost;

    public ShippingInfo(String city, int zone, double cost) {
        this.city = city;
        this.zone = zone;
        this.cost = cost;
    }

    public String getCity() { return city; }
    public int getZone() { return zone; }
    public double getCost() { return cost; }
}

package com.web_app.shipping;

/**
 * Represents Norwegian shipping zones based on postal code ranges.
 * Zone boundaries are derived from Posten's regional groupings.
 *
 * Zone 1: Southern Norway (0001-4999) - Major cities: Oslo, Stavanger
 * Zone 2: Western/Central Norway (5000-7999) - Major cities: Bergen, Trondheim
 * Zone 3: Northern Norway (8000-9999) - Major cities: Bodø, Tromsø
 */
public enum ShippingZone {

    ZONE_1("South", 0, 4999, 49.0),
    ZONE_2("West/Central", 5000, 7999, 79.0),
    ZONE_3("North", 8000, 9999, 99.0);

    private final String regionName;
    private final int lowerBound;
    private final int upperBound;
    private final double shippingCost;

    ShippingZone(String regionName, int lowerBound, int upperBound, double shippingCost) {
        this.regionName = regionName;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.shippingCost = shippingCost;
    }

    public String getRegionName() {
        return regionName;
    }

    public double getShippingCost() {
        return shippingCost;
    }

    /**
     * Determines the shipping zone for a given postal code number.
     *
     * @param postalCodeNumber the numeric postal code
     * @return the corresponding ShippingZone
     * @throws IllegalArgumentException if the postal code doesn't fall within any zone
     */
    public static ShippingZone fromPostalCode(int postalCodeNumber) {
        for (ShippingZone zone : values()) {
            if (postalCodeNumber >= zone.lowerBound && postalCodeNumber <= zone.upperBound) {
                return zone;
            }
        }
        throw new IllegalArgumentException("No shipping zone found for postal code: " + postalCodeNumber);
    }
}

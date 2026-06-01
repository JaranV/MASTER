package com.web_app.shipping;

/**
 * Data Transfer Object for postal code lookup responses.
 * Encapsulates the result of a postal code validation and shipping zone calculation.
 */
public class PostalCodeLookupResult {

    private final boolean valid;
    private final String postalCode;
    private final String city;
    private final String zoneName;
    private final double shippingCost;

    private PostalCodeLookupResult(boolean valid, String postalCode, String city,
                                    String zoneName, double shippingCost) {
        this.valid = valid;
        this.postalCode = postalCode;
        this.city = city;
        this.zoneName = zoneName;
        this.shippingCost = shippingCost;
    }

    /**
     * Factory method for a successful lookup.
     */
    public static PostalCodeLookupResult found(PostalCodeEntry entry) {
        ShippingZone zone = entry.getShippingZone();
        return new PostalCodeLookupResult(
                true,
                entry.getPostalCode(),
                entry.getCity(),
                zone.getRegionName(),
                zone.getShippingCost()
        );
    }

    /**
     * Factory method for an unsuccessful lookup.
     */
    public static PostalCodeLookupResult notFound(String postalCode) {
        return new PostalCodeLookupResult(false, postalCode, null, null, 0);
    }

    public boolean isValid() {
        return valid;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCity() {
        return city;
    }

    public String getZoneName() {
        return zoneName;
    }

    public double getShippingCost() {
        return shippingCost;
    }
}

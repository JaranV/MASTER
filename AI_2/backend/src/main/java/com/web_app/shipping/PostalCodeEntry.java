package com.web_app.shipping;

/**
 * Immutable value object representing a single entry from Posten's
 * postal code register (postnummerregisteret).
 *
 * Each entry maps a 4-digit postal code to its corresponding city,
 * municipality, and postal category.
 */
public class PostalCodeEntry {

    private final String postalCode;
    private final String city;
    private final String municipalityCode;
    private final String municipality;
    private final String category;

    public PostalCodeEntry(String postalCode, String city, String municipalityCode,
                           String municipality, String category) {
        this.postalCode = postalCode;
        this.city = city;
        this.municipalityCode = municipalityCode;
        this.municipality = municipality;
        this.category = category;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCity() {
        return city;
    }

    public String getMunicipalityCode() {
        return municipalityCode;
    }

    public String getMunicipality() {
        return municipality;
    }

    public String getCategory() {
        return category;
    }

    /**
     * Determines the shipping zone for this postal code entry.
     *
     * @return the ShippingZone based on the numeric value of the postal code
     */
    public ShippingZone getShippingZone() {
        return ShippingZone.fromPostalCode(Integer.parseInt(postalCode));
    }
}

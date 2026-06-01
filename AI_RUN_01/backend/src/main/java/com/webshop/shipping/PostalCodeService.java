package com.webshop.shipping;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class PostalCodeService {

    private final Map<String, String> postalToCity = new HashMap<>();

    @PostConstruct
    public void load() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("postnummer.csv").getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // header
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",", -1);
                if (parts.length >= 2) {
                    postalToCity.put(parts[0].trim(), parts[1].trim());
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load postnummer.csv", e);
        }
    }

    public ShippingInfo lookup(String postalCode) {
        if (postalCode == null || !postalCode.matches("\\d{4}")) {
            throw new IllegalArgumentException("Postal code must be 4 digits");
        }
        String city = postalToCity.get(postalCode);
        if (city == null) {
            throw new IllegalArgumentException("Unknown postal code: " + postalCode);
        }
        int code = Integer.parseInt(postalCode);
        int zone;
        double cost;
        if (code >= 4000 && code <= 4099) {
            zone = 1;
            cost = 0.0;
        } else if (code >= 4100 && code <= 4999) {
            zone = 2;
            cost = 49.0;
        } else {
            zone = 3;
            cost = 99.0;
        }
        return new ShippingInfo(city, zone, cost);
    }
}

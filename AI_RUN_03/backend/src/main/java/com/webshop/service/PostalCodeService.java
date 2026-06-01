package com.webshop.service;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class PostalCodeService {

    private final Map<String, String> postalToCity = new HashMap<>();

    @PostConstruct
    public void loadPostalCodes() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("postnummer.csv").getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    postalToCity.put(parts[0].trim(), parts[1].trim());
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load postnummer.csv", e);
        }
    }

    public String lookupCity(String postalCode) {
        return postalToCity.get(postalCode);
    }

    public int zoneFor(String postalCode) {
        if (postalCode == null || postalCode.length() != 4) {
            return 3;
        }
        int code;
        try {
            code = Integer.parseInt(postalCode);
        } catch (NumberFormatException e) {
            return 3;
        }
        if (code >= 4000 && code <= 4099) {
            return 1;
        }
        if (code >= 4100 && code <= 4999) {
            return 2;
        }
        return 3;
    }

    public double shippingCostFor(int zone) {
        return switch (zone) {
            case 1 -> 0.0;
            case 2 -> 49.0;
            default -> 99.0;
        };
    }
}

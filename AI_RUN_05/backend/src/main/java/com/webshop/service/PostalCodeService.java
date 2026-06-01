package com.webshop.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.webshop.dto.PostalCodeInfo;

import jakarta.annotation.PostConstruct;

@Service
public class PostalCodeService {

    private final Map<String, String> postalCodeToCity = new HashMap<>();

    @PostConstruct
    public void load() throws IOException {
        ClassPathResource resource = new ClassPathResource("postnummer.csv");
        try (InputStream in = resource.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",", -1);
                if (parts.length >= 2) {
                    postalCodeToCity.put(parts[0].trim(), parts[1].trim());
                }
            }
        }
    }

    public Optional<PostalCodeInfo> lookup(String postalCode) {
        if (postalCode == null || !postalCode.matches("\\d{4}")) {
            return Optional.empty();
        }
        String city = postalCodeToCity.get(postalCode);
        if (city == null) {
            return Optional.empty();
        }
        int zone = determineZone(postalCode);
        double cost = shippingCost(zone);
        return Optional.of(new PostalCodeInfo(postalCode, city, zone, cost));
    }

    private int determineZone(String postalCode) {
        int code = Integer.parseInt(postalCode);
        if (code >= 4000 && code <= 4099) {
            return 1;
        }
        if (code >= 4100 && code <= 4999) {
            return 2;
        }
        return 3;
    }

    private double shippingCost(int zone) {
        return switch (zone) {
            case 1 -> 0.0;
            case 2 -> 49.0;
            default -> 99.0;
        };
    }
}

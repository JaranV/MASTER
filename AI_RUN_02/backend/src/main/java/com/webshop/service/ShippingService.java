package com.webshop.service;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@Service
public class ShippingService {

    private final Map<String, String> postalMap = new HashMap<>();

    @PostConstruct
    void load() {
        try (var reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("postnummer.csv").getInputStream()))) {
            reader.lines().skip(1).forEach(line -> {
                var parts = line.split(",");
                if (parts.length >= 2) postalMap.put(parts[0].trim(), parts[1].trim());
            });
        } catch (Exception ignored) {}
    }

    public String city(String postalCode) {
        return postalMap.getOrDefault(postalCode, "");
    }

    public int zone(String postalCode) {
        try {
            int n = Integer.parseInt(postalCode);
            if (n >= 4000 && n <= 4099) return 1;
            if (n >= 4100 && n <= 4999) return 2;
        } catch (NumberFormatException ignored) {}
        return 3;
    }

    public double cost(int zone) {
        return switch (zone) {
            case 1 -> 0.0;
            case 2 -> 49.0;
            default -> 99.0;
        };
    }
}

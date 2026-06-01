package com.webshop.controller;

import com.webshop.service.PostalCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/postal-code")
public class PostalCodeController {

    private final PostalCodeService postalCodeService;

    public PostalCodeController(PostalCodeService postalCodeService) {
        this.postalCodeService = postalCodeService;
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> lookup(@PathVariable String code) {
        String city = postalCodeService.lookupCity(code);
        if (city == null) {
            return ResponseEntity.notFound().build();
        }
        int zone = postalCodeService.zoneFor(code);
        double shippingCost = postalCodeService.shippingCostFor(zone);
        return ResponseEntity.ok(Map.of(
                "postalCode", code,
                "city", city,
                "shippingZone", zone,
                "shippingCost", shippingCost
        ));
    }
}

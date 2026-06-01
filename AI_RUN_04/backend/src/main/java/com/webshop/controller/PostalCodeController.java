package com.webshop.controller;

import com.webshop.service.PostalCodeService;
import com.webshop.service.ShippingInfo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/postal-codes")
public class PostalCodeController {

    private final PostalCodeService postalCodeService;

    public PostalCodeController(PostalCodeService postalCodeService) {
        this.postalCodeService = postalCodeService;
    }

    @GetMapping("/{code}")
    public Map<String, Object> lookup(@PathVariable String code) {
        ShippingInfo info = postalCodeService.resolve(code);
        return Map.of(
                "postalCode", code,
                "city", info.getCity(),
                "zone", info.getZone(),
                "shippingCost", info.getCost()
        );
    }
}

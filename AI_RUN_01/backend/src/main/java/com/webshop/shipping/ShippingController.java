package com.webshop.shipping;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private final PostalCodeService postalCodeService;

    public ShippingController(PostalCodeService postalCodeService) {
        this.postalCodeService = postalCodeService;
    }

    @GetMapping
    public ShippingInfo lookup(@RequestParam String postalCode) {
        return postalCodeService.lookup(postalCode);
    }
}

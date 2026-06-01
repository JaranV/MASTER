package com.web_app.controller;

import com.web_app.shipping.PostalCodeLookupResult;
import com.web_app.shipping.PostalCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing postal code lookup functionality.
 * Provides real-time postal code validation and shipping zone resolution.
 */
@RestController
@RequestMapping("/api/postalcodes")
public class PostalCodeController {

    private final PostalCodeService postalCodeService;

    public PostalCodeController(PostalCodeService postalCodeService) {
        this.postalCodeService = postalCodeService;
    }

    /**
     * Looks up a postal code and returns city + shipping zone information.
     *
     * @param postalCode the 4-digit Norwegian postal code
     * @return 200 with lookup result if found, 404 if not found
     */
    @GetMapping("/{postalCode}")
    public ResponseEntity<PostalCodeLookupResult> lookup(@PathVariable String postalCode) {
        PostalCodeLookupResult result = postalCodeService.resolve(postalCode);

        if (result.isValid()) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }
}

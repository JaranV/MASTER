package com.webshop.controller;

import com.webshop.model.Product;
import com.webshop.repository.ProductRepository;
import com.webshop.service.PostalCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository productRepository;
    private final PostalCodeService postalCodeService;

    public ProductController(ProductRepository productRepository, PostalCodeService postalCodeService) {
        this.productRepository = productRepository;
        this.postalCodeService = postalCodeService;
    }

    @GetMapping("/products")
    public List<Map<String, Object>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {

        List<Product> products = productRepository.findBySearchAndCategory(
                search != null && !search.isBlank() ? search : null,
                category != null && !category.isBlank() ? category : null
        );

        return products.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("description", p.getDescription());
            map.put("price", p.getPrice());
            map.put("stock", p.getStock());
            map.put("category", p.getCategory());
            map.put("imageUrl", p.getImageUrl());
            map.put("lowStock", p.isLowStock());
            return map;
        }).toList();
    }

    @GetMapping("/products/categories")
    public List<String> getCategories() {
        return productRepository.findAllCategories();
    }

    @GetMapping("/postal/{code}")
    public ResponseEntity<?> lookupPostalCode(@PathVariable String code) {
        if (!postalCodeService.isValidPostalCode(code)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid postal code format"));
        }
        String city = postalCodeService.lookupCity(code);
        if (city == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
                "postalCode", code,
                "city", city,
                "shippingCost", postalCodeService.calculateShipping(code)
        ));
    }
}

package com.webshop.Controller;

import com.webshop.Entity.ProductEntity;
import com.webshop.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/products")
    List<ProductEntity> getProducts() {
        return productRepository.findAll();
    }
}

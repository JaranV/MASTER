package com.webshop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webshop.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}

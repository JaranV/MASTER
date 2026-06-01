package com.webshop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webshop.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByStripeSessionId(String stripeSessionId);
}

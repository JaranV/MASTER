package com.webshop.Repository;

import com.webshop.Entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    CustomerEntity findByStripeCustomerId(String stripeCustomerId);
    CustomerEntity findByEmail(String email);
}

package com.webshop.Repository;

import com.webshop.Entity.SubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, Long> {
    SubscriptionEntity findByStripeSubscriptionId(String stripeSubscriptionId);
    List<SubscriptionEntity> findByCustomerEmail(String customerEmail);
}

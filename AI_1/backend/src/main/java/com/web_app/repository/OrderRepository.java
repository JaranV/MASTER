//this gives a set of db operations for Order without writing SQL
// (e.g., save, findbyID, findALL, delte, count)

package com.web_app.repository;

import com.web_app.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {}

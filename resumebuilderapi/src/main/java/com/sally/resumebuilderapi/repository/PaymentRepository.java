package com.sally.resumebuilderapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sally.resumebuilderapi.document.Payment;
import com.sally.resumebuilderapi.enums.PaymentStatus;

public interface PaymentRepository extends MongoRepository<Payment, String> {
	Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByPaymentKey(String paymentKey);
    
    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Payment> findByStatus(PaymentStatus status);
    
}
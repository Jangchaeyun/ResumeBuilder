package com.sally.resumebuilderapi.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sally.resumebuilderapi.document.Payment;

public interface PaymentRepository extends MongoRepository<Payment, String> {
	Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByPaymentKey(String paymentKey);
}
package com.sally.resumebuilderapi.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sally.resumebuilderapi.document.Payment;

public interface PaymentRepository extends MongoRepository<Payment, String> {
	
}

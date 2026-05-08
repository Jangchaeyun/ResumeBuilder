package com.sally.resumebuilderapi.service;

import org.springframework.stereotype.Service;

import com.sally.resumebuilderapi.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j

public class PaymentService {
	private final PaymentRepository paymentRepository;
}

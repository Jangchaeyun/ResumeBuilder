package com.sally.resumebuilderapi.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sally.resumebuilderapi.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping
@Slf4j
public class PaymentController {
	private final PaymentService paymentService;
	
	@PostMapping("/create-order")
	public ResponseEntity<?> createOrder(@RequestBody Map<String, String> request,
											Authentication authentication) {
		String planType = request.get("planType");
		if (!"premium".equalsIgnoreCase(planType)) {
			return ResponseEntity.badRequest().body(Map.of("message","Invalid plan type"));
		}
	}
	
	@PostMapping("/verify")
	public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
		return null;
	}
	
	@GetMapping("/history")
	public ResponseEntity<?> getPaymentHistory(Authentication authentication) {
		return null;
	}
	
	@GetMapping("/order/{orderId}")
	public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
		return null;
	}
}

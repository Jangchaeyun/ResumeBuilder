package com.sally.resumebuilderapi.controller;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sally.resumebuilderapi.document.Payment;
import com.sally.resumebuilderapi.service.PaymentService;
import com.sally.resumebuilderapi.util.ApiConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {
	private final PaymentService paymentService;
	
	@PostMapping("/create-order")
	public ResponseEntity<?> createOrder(@RequestBody Map<String, String> request,
											Authentication authentication) {
		String planType = request.get("planType");
		if (!ApiConstants.PREMIUM.equalsIgnoreCase(planType)) {
			return ResponseEntity.badRequest().body(Map.of("message","Invalid plan type"));
		}
		
		Payment payment = paymentService.createOrder(authentication.getPrincipal(), planType);
		
		Map<String, Object> response = Map.of(
				"orderId", payment.getOrderId(),
				"amount", payment.getAmount(),
				"currency", payment.getCurrency()
		);
		
		return ResponseEntity.ok(response);
	}
	
	@PostMapping("/verify")
	public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
		try {

	        String paymentKey = (String) request.get("paymentKey");
	        String orderId = (String) request.get("orderId");
	        Long amount = Long.parseLong(request.get("amount"));

	        if (Objects.isNull(paymentKey)
	                || Objects.isNull(orderId)
	                || Objects.isNull(amount)) {

	            return ResponseEntity.badRequest().body(
	                    Map.of(
	                            "message",
	                            "Missing required payment parameters"
	                    )
	            );
	        }

	        Payment payment = paymentService.verifyPayment(
	                paymentKey,
	                orderId,
	                amount
	        );

	        return ResponseEntity.ok(
	                Map.of(
	                        "message", "Payment verified successfully",
	                        "status", "success",
	                        "payment", payment
	                )
	        );

	    } catch (Exception e) {

	        log.error("Payment verify failed", e);

	        return ResponseEntity.badRequest().body(
	                Map.of(
	                        "message", e.getMessage()
	                )
	        );
	    }
	}
	
	@GetMapping("/history")
	public ResponseEntity<?> getPaymentHistory(Authentication authentication) {
		List<Payment> payments = paymentService.getUserPayments(authentication.getPrincipal());
		
		return ResponseEntity.ok(payments);
	}
	
	@GetMapping("/order/{orderId}")
	public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
		Payment paymentDetails = paymentService.getPaymentDetails(orderId);
		
		return ResponseEntity.ok(paymentDetails);
	}
}

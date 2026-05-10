package com.sally.resumebuilderapi.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sally.resumebuilderapi.document.Payment;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.repository.PaymentRepository;
import com.sally.resumebuilderapi.util.ApiConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j

public class PaymentService {
	private final PaymentRepository paymentRepository;
    private final AuthService authService;
	
	@Value("${toss.payments.secret-key}")
    private String tosspaySecretKey;

    @Value("${toss.payments.client-key}")
    private String tosspayClientKey;

	
	
	public Payment createOrder(Object principal, String planType) {
		AuthResponse authResponse = authService.getProfile(principal);
		int amount = getPlanAmount(planType);

        Payment newPayment = Payment.builder()
                .userId(authResponse.getId())
                .orderId(generateOrderId())
                .amount(amount)
                .currency("KRW")
                .planType(planType)
                .status("READY")
                .build();

        return paymentRepository.save(newPayment);
	}
	
	private int getPlanAmount(String planType) {

        if (ApiConstants.PREMIUM.equalsIgnoreCase(planType)) {
            return 4900;
        }

        throw new RuntimeException("Invalid plan type");
    }

    private String generateOrderId() {
        return "ORDER_" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 20);
    }
}

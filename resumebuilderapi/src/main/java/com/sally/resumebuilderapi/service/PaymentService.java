package com.sally.resumebuilderapi.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.reactive.function.client.WebClient;

import com.sally.resumebuilderapi.document.Payment;
import com.sally.resumebuilderapi.document.User;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.enums.PaymentStatus;
import com.sally.resumebuilderapi.repository.PaymentRepository;
import com.sally.resumebuilderapi.repository.UserRepository;
import com.sally.resumebuilderapi.util.ApiConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j

public class PaymentService {

    private final CorsConfigurationSource corsConfigurationSource;
	private final PaymentRepository paymentRepository;
    private final AuthService authService;
    private final UserRepository userRepository;
	
	@Value("${toss.payments.secret-key}")
    private String tosspaySecretKey;

    @Value("${toss.payments.client-key}")
    private String tosspayClientKey;
	
    public Payment createOrder(
            Object principal,
            String planType) {

        AuthResponse authResponse =
                authService.getProfile(principal);

        Long amount = getPlanAmount(planType);

        Payment newPayment = Payment.builder()
                .userId(authResponse.getId())
                .orderId(generateOrderId())
                .amount(amount)
                .currency("KRW")
                .planType(planType)
                .status(PaymentStatus.READY)
                .build();

        return paymentRepository.save(newPayment);
    }
    
	
    private Long getPlanAmount(String planType) {

        if (ApiConstants.PREMIUM
                .equalsIgnoreCase(planType)) {

            return 4900L;
        }

        throw new RuntimeException("Invalid plan type");
    }
    

    private String generateOrderId() {
        return "ORDER_" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 20);
    }

    public Payment verifyPayment(
            String paymentKey,
            String orderId,
            Long amount) {

        Payment payment = paymentRepository
                .findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found"));

        // 금액 검증
        if (!payment.getAmount().equals(amount)) {
            throw new RuntimeException("Invalid payment amount");
        }
        
        String encodedKey = Base64.getEncoder()
                .encodeToString(
                        (tosspaySecretKey + ":")
                                .getBytes(StandardCharsets.UTF_8)
                );

        WebClient webClient = WebClient.builder()
                .baseUrl("https://api.tosspayments.com")
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Basic " + encodedKey
                )
                .defaultHeader(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();

        Map<String, Object> response = webClient.post()
                .uri("/v1/payments/confirm")
                .bodyValue(Map.of(
                        "paymentKey", paymentKey,
                        "orderId", orderId,
                        "amount", amount
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        payment.setPaymentKey(paymentKey);
        payment.setStatus(PaymentStatus.DONE);
        payment.setApprovedAt(LocalDateTime.now());

        if (response != null) {

            payment.setMethod(
                    (String) response.get("method")
            );

            Object receiptObj = response.get("receipt");

            if (receiptObj instanceof Map<?, ?> receiptMap) {

                Object url = receiptMap.get("url");

                if (url != null) {
                    payment.setReceiptUrl(url.toString());
                }
            }

            payment.setRawData(response);
        }
        
        paymentRepository.save(payment);
        
        upgradeUserSubscription(payment.getUserId(), payment.getPlanType());
        
        return payment;
    }


	private void upgradeUserSubscription(String userId, String planType) {
		User existingUser = userRepository.findById(userId)
			.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		existingUser.setSubscriptionPlan(planType);
		userRepository.save(existingUser);
		log.info("User {} upgraded to {} plan", userId, planType);
	}


	public List<Payment> getUserPayments(Object principal) {
		AuthResponse authResponse = authService.getProfile(principal);
		
		return paymentRepository.findByUserIdOrderByCreatedAtDesc(authResponse.getId());
	}


	public Payment getPaymentDetails(String orderId) {
		return paymentRepository.findByOrderId(orderId)
			.orElseThrow(() -> new RuntimeException("Order not found"));
	}
}

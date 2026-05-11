package com.sally.resumebuilderapi.document;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sally.resumebuilderapi.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "payments")
public class Payment {

	@Id
    @JsonProperty("_id")
    private String id;

    /**
     * 사용자 ID
     */
    private String userId;

    /**
     * Toss Payment Key
     */
    private String paymentKey;

    /**
     * 주문 번호
     */
    private String orderId;

    /**
     * 결제 금액
     */
    private Long amount;

    /**
     * 통화
     * ex) KRW
     */
    private String currency;

    /**
     * 플랜 타입
     * ex) PREMIUM
     */
    private String planType;

    /**
     * 결제 상태
     */
    @Builder.Default
    private PaymentStatus status = PaymentStatus.READY;

    /**
     * 결제 수단
     * ex) CARD, TRANSFER
     */
    private String method;

    /**
     * 영수증 URL
     */
    private String receiptUrl;

    /**
     * 결제 승인 시간
     */
    private LocalDateTime approvedAt;

    /**
     * 결제 실패 사유
     */
    private String failReason;

    /**
     * Toss 원본 응답 데이터
     */
    private Map<String, Object> rawData;

    /**
     * 생성 시간
     */
    @CreatedDate
    private LocalDateTime createdAt;

    /**
     * 수정 시간
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
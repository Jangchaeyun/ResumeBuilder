package com.sally.resumebuilderapi.document;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    private String userId;

    // Toss Payments
    private String paymentKey;
    private String orderId;

    private Integer amount;
    private String currency;

    private String planType;

    @Builder.Default
    private String status = "READY";

    private String method; // CARD, TRANSFER 등

    private String receiptUrl;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
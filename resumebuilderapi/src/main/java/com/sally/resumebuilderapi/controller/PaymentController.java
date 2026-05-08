package com.sally.resumebuilderapi.controller;

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
	
}

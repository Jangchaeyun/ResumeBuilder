package com.sally.resumebuilderapi.controller;

import java.util.Map;

import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.dto.RegisterRequest;
import com.sally.resumebuilderapi.service.AuthService;
import com.sally.resumebuilderapi.util.ApiConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping(ApiConstants.AUTH_CONTROLLER)
public class AuthController {
	private final AuthService authService;
	
	@PostMapping(ApiConstants.REGISTER)
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
		log.info("Inside AuthController - register(): {}", request);
		AuthResponse response = authService.register(request);
		log.info("Response from service: {}", response);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@GetMapping(ApiConstants.VERIFY_EMAIL)
	public ResponseEntity<?> verifyEmail(@RequestParam String token) {
		log.info("Inside AuthController - verifyEmail(): {}", token);
		authService.verifyEmail(token);
		return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Email verified successfully"));
	}
	
	
}

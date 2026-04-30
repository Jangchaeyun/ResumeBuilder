package com.sally.resumebuilderapi.controller;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sally.resumebuilderapi.document.User;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.dto.LoginRequest;
import com.sally.resumebuilderapi.dto.RegisterRequest;
import com.sally.resumebuilderapi.service.AuthService;
import com.sally.resumebuilderapi.service.FileUploadService;
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
	private final FileUploadService fileUploadService;
	
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
	
	@PostMapping(ApiConstants.UPLOAD_PROFILE)
	public ResponseEntity<?> uploadImage(@RequestPart("image") MultipartFile file) throws IOException {
		log.info("Inside AuthController - uploadImage()");
		Map<String, String> response = fileUploadService.uploadSingleImage(file);
		return ResponseEntity.ok(response);
	}
	
	@PostMapping(ApiConstants.LOGIN)
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
		AuthResponse response = authService.login(request);
		return ResponseEntity.ok(response);
	}
	
	@PostMapping(ApiConstants.RESEND_VERIFICATION)
	public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
		String email = body.get("email");
		
		if (Objects.isNull(email)) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
		}
		
		authService.resendVerification(email);
		
		return ResponseEntity.ok(Map.of("success", true, "message", "Verification email sent"));
	}
	
	@GetMapping(ApiConstants.PROFILE)
	public ResponseEntity<?> getProfile(Authentication authentication) {
		Object principalObject = authentication.getPrincipal();
		
		AuthResponse currentProfile = authService.getProfile(principalObject);
		
		return ResponseEntity.ok(currentProfile);
	}
}

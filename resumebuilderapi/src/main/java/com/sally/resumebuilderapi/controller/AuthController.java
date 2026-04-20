package com.sally.resumebuilderapi.controller;

import java.util.Map;

import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.sally.resumebuilderapi.ResumebuilderapiApplication;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.dto.RegisterRequest;
import com.sally.resumebuilderapi.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
public class AuthController {

    private final ResumebuilderapiApplication resumebuilderapiApplication;
	private final AuthService authService;
	
	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
		AuthResponse response = authService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
}

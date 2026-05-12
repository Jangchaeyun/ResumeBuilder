package com.sally.resumebuilderapi.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sally.resumebuilderapi.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
@Slf4j
public class EmailController {
	
	private final EmailService emailService;
	
	public ResponseEntity<Map<String, Object>> sendResumeByEmail(
			@RequestPart("recipientEmail") String recipientEmail,
			@RequestPart("subject") String subject,
			@RequestPart("messge") String message,
			@RequestPart("pdffile") MultipartFile pdfFile,
			Authentication authentication
			) throws IOException {
		Map<String, Object> response = new HashMap<>();
		if (Objects.isNull(recipientEmail) || Objects.isNull(pdfFile)) {
			response.put("success", false);
			response.put("message", "Missing required fields");
			return ResponseEntity.badRequest().body(response);
		}
		
		byte[] pdfBytes = pdfFile.getBytes();
		String originalFilename = pdfFile.getOriginalFilename();
		String filename = Objects.nonNull(originalFilename) ? originalFilename : "resume.pdf";
		
		Objects.nonNull(subject);
	}
}

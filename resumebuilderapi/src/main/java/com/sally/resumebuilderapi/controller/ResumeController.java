package com.sally.resumebuilderapi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sally.resumebuilderapi.document.Resume;
import com.sally.resumebuilderapi.dto.CreateResimeRequest;
import com.sally.resumebuilderapi.service.ResumeService;
import com.sally.resumebuilderapi.util.ApiConstants;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping(ApiConstants.RESUME)
@RequiredArgsConstructor
@Slf4j
public class ResumeController {
	private final ResumeService resumeService;
	
	@PostMapping
	public ResponseEntity<?> createResume(@Valid @RequestBody CreateResimeRequest request) {
		Resume newResume = resumeService.createResume(request);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(newResume);
	}
	
	@GetMapping
	public ResponseEntity<?> getUserResumes() {
		
	}
	
	@GetMapping(ApiConstants.ID)
	public ResponseEntity<?> getResumeById(@PathVariable String id) {
		
	}
	
	@PutMapping(ApiConstants.ID)
	public ResponseEntity<?> updateResume(@PathVariable String id,
											@RequestBody Resume updatedDate) {
		
	}
	
	@PutMapping(ApiConstants.UPLOAD_IMAGES)
	public ResponseEntity<?> uploadResumeImages(@PathVariable String id,
			@RequestPart(value = "thumbnail", required = true) MultipartFile thumbnail,
			@RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
			HttpServletRequest request) {
		
	}
	
	@DeleteMapping(ApiConstants.ID)
	public ResponseEntity<?> deleteResume(@PathVariable String id) {
		
	}
}

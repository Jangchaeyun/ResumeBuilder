package com.sally.resumebuilderapi.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
import com.sally.resumebuilderapi.dto.CreateResumeRequest;
import com.sally.resumebuilderapi.service.FileUploadService;
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
	private final FileUploadService fileUploadService;
	
	@PostMapping
	public ResponseEntity<?> createResume(@Valid @RequestBody CreateResumeRequest request,
			Authentication authentication) {
		Resume newResume = resumeService.createResume(request, authentication.getPrincipal());
		
		return ResponseEntity.status(HttpStatus.CREATED).body(newResume);
	}
	
	@GetMapping
	public ResponseEntity<?> getUserResumes(Authentication authentication) {
		List<Resume> resumes = resumeService.getUserResumes(authentication.getPrincipal());
		
		return ResponseEntity.ok(resumes);
	}
	
	@GetMapping(ApiConstants.ID)
	public ResponseEntity<?> getResumeById(@PathVariable String id, Authentication authentication) {
		Resume existingResume = resumeService.getResumeById(id, authentication.getPrincipal());
		
		return ResponseEntity.ok(existingResume);
	}
	
	@PutMapping(ApiConstants.ID)
	public ResponseEntity<?> updateResume(@PathVariable String id,
											@RequestBody Resume updatedData,
											Authentication authentication) {
		Resume updatedResume = resumeService.updateResume(id, updatedData, authentication.getPrincipal());
		
		return ResponseEntity.ok(updatedResume);
	}
	
	@PutMapping(ApiConstants.UPLOAD_IMAGES)
	public ResponseEntity<?> uploadResumeImages(@PathVariable String id,
			@RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
			@RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
			HttpServletRequest request,
			Authentication authentication) throws IOException {
		Map<String, String> response = fileUploadService.uploadSingleImage(id, authentication.getPrincipal(), thumbnail, profileImage);
			
		return ResponseEntity.ok(response);
	}
	
	@DeleteMapping(ApiConstants.ID)
	public ResponseEntity<?> deleteResume(@PathVariable String id,
			Authentication authentication) {
		resumeService.deleteResume(id, authentication.getPrincipal());
		
		return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
	}
}

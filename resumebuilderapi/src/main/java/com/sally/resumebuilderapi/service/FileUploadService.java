package com.sally.resumebuilderapi.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {
	private final Cloudinary cloudinary;
	private final AuthService authService;
	private final ResumeRepository resumeRepository;
	
	public Map<String, String> uploadSingleImage(MultipartFile file) throws IOException {
		Map<String, Object> imageUploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "image"));
		log.info("Inside FileUploadService - uploadSingleImage() {}", imageUploadResult.get("secure_url").toString());
		return Map.of("imageUrl", imageUploadResult.get("secure_url").toString());
	}

	public Map<String, String> uploadSingleImage(String resumeId, Object principal, MultipartFile thumbnail,
			MultipartFile profileImage) throws IOException {
		AuthResponse response = authService.getProfile(principal);
		
		resumeRepository.findByUserIdAndId(response.getId(), resumeId)
			.orElseThrow(() -> new RuntimeException("Resume not found"));
		
		Map<String, String> returnValue = new HashMap<>();
		Map<String, String> thumbnailResult = uploadSingleImage(thumbnail);
		
		return null;
	}
}

package com.sally.resumebuilderapi.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sally.resumebuilderapi.document.Resume;
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
		
		Resume existingResume = resumeRepository.findByUserIdAndId(response.getId(), resumeId)
			.orElseThrow(() -> new RuntimeException("Resume not found"));
		
		Map<String, String> returnValue = new HashMap<>();
		
		Map<String, String> uploadResult = new HashMap<>();
		
		if (Objects.nonNull(thumbnail)) {
			uploadResult = uploadSingleImage(thumbnail);
			existingResume.setThumbnailLink(resumeId);
			returnValue.put("thumbnailLink", uploadResult.get("imageUrl"));
		}
		
		if (Objects.nonNull(profileImage)) {
			uploadResult = uploadSingleImage(profileImage);
			if (Objects.isNull(existingResume.getProfileInfo())) {
				existingResume.setProfileInfo(new Resume.ProfileInfo());
			}
			existingResume.getProfileInfo().setProfileReviewUrl(uploadResult.get("imageUrl"));
			returnValue.put("profilePreviewUrl", uploadResult.get("imageUrl"));
		}
		
		resumeRepository.save(existingResume);
		returnValue.put("message", "Images uploaded successfully");
		
		return returnValue;
	}
}

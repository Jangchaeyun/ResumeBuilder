package com.sally.resumebuilderapi.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileUploadService {
	private final Cloudinary cloudinary;
	
	public Map<String, String> uploadSingleImage(MultipartFile file) throws IOException {
		Map<String, Object> imageUploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "image"));
		return Map.of("imageUrl", imageUploadResult.get("secure_url").toString());
	}
}

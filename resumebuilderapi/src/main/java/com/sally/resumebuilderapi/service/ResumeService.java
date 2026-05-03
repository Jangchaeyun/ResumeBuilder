package com.sally.resumebuilderapi.service;

import org.springframework.stereotype.Service;

import com.sally.resumebuilderapi.document.Resume;
import com.sally.resumebuilderapi.dto.CreateResimeRequest;
import com.sally.resumebuilderapi.repository.ResumeRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {
	
	private final ResumeRepository resumeRepository;
	
	public Resume createResume(CreateResimeRequest request) {
		Resume newResume = new Resume();
		return null;
	}
	
}

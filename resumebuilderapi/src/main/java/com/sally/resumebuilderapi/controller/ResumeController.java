package com.sally.resumebuilderapi.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sally.resumebuilderapi.service.ResumeService;
import com.sally.resumebuilderapi.util.ApiConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping(ApiConstants.RESUME)
@RequiredArgsConstructor
@Slf4j
public class ResumeController {
	private final ResumeService resumeService;
	
	
}

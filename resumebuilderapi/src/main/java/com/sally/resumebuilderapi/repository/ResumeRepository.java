package com.sally.resumebuilderapi.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sally.resumebuilderapi.document.Resume;
import com.sally.resumebuilderapi.service.ResumeService;

public interface ResumeRepository extends MongoRepository<Resume, String>{	
}

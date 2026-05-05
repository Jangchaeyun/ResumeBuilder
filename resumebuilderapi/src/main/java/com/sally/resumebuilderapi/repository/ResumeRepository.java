package com.sally.resumebuilderapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sally.resumebuilderapi.document.Resume;

public interface ResumeRepository extends MongoRepository<Resume, String>{	
	List<Resume> findByUserIdOrderByUpdatedAtDesc(String userId);
	
	Optional<Resume> findByUserIdAndId(String userId, String id);
	
}
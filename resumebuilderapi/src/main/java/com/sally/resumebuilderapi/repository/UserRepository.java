package com.sally.resumebuilderapi.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sally.resumebuilderapi.document.User;

public interface UserRepository extends MongoRepository<User, String>{
	Optional<User> findByEmail(String email);
	
	Boolean existsByEmail(String email);
	
	Optional<User> findByVerificationToken(String verificationToken);
}

package com.sally.resumebuilderapi.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sally.resumebuilderapi.document.User;
import com.sally.resumebuilderapi.dto.AuthResponse;
import com.sally.resumebuilderapi.dto.LoginRequest;
import com.sally.resumebuilderapi.dto.RegisterRequest;
import com.sally.resumebuilderapi.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final PasswordEncoder passwordEncoder;
	
	@Value("${app.base.url}")
	private String appBaseUrl;
	
	public AuthResponse register(RegisterRequest request) {
		log.info("Inside AuthServic: register() {} ", request);
		
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("User already exists with this email");
		}
		
		User newUser = toDocument(request);
		
		userRepository.save(newUser);
		
		sendVerificationEmail(newUser);
		
		return toResponse(newUser);
	}
	
	
	
	private void sendVerificationEmail(User newUser) {
		log.info("Inside AuthService - sendVerificationEmail(): {}", newUser);
		try {
			String link = appBaseUrl + "/api/auth/verify-email?token=" + newUser.getVerificationToken();
			String html = ""
	                + "<div style='background-color:#f9fafb; padding:40px 0; font-family:Arial,sans-serif;'>"
	                + "  <div style='max-width:480px; margin:0 auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08); text-align:center;'>"
	                
	                + "    <h2 style='color:#111827; margin-bottom:20px;'>이메일 인증</h2>"
	                
	                + "    <p style='color:#374151; font-size:14px;'>"
	                + newUser.getName() + "님, 가입해주셔서 감사합니다 😊<br>"
	                + "아래 버튼을 눌러 이메일 인증을 완료해주세요."
	                + "    </p>"
	                
	                + "    <a href='" + link + "'"
	                + "       style='display:inline-block; margin-top:20px; padding:12px 20px; "
	                + "              background:#6366f1; color:#ffffff; font-size:14px; "
	                + "              border-radius:8px; text-decoration:none; font-weight:bold;'>"
	                + "        이메일 인증하기"
	                + "    </a>"
	                
	                + "    <p style='margin-top:25px; font-size:12px; color:#6b7280;'>"
	                + "        버튼이 동작하지 않는다면 아래 링크를 복사해주세요."
	                + "    </p>"
	                
	                + "    <p style='word-break:break-all; font-size:12px; color:#4b5563;'>"
	                + link
	                + "    </p>"
	                
	                + "    <p style='margin-top:20px; font-size:12px; color:#9ca3af;'>"
	                + "        이 링크는 24시간 동안 유효합니다."
	                + "    </p>"
	                
	                + "  </div>"
	                + "</div>";
			emailService.sendHtmlEmail(newUser.getEmail(), "이메일을 인증하세요", html);
		} catch (Exception e) {
			log.error("Exception occured at sendVerificationEmail(): {}", e.getMessage());
			throw new RuntimeException("Failed to send verification email: " + e.getMessage());
		}
	}



	private AuthResponse toResponse(User newUser) {
		return AuthResponse.builder()
				.id(newUser.getId())
				.name(newUser.getName())
				.email(newUser.getEmail())
				.profileImageUrl(newUser.getProfileImageUrl())
				.emailVerified(newUser.isEmailVerified())
				.subscriptionPlan(newUser.getSubscriptionPlan())
				.createdAt(newUser.getCreatedAt())
				.updatedAt(newUser.getUpdatedAt())
				.build();
	}
	
	private User toDocument(RegisterRequest request) {
		 return User.builder()
			.name(request.getName())
			.email(request.getEmail())
			.password(passwordEncoder.encode(request.getPassword()))
			.profileImageUrl(request.getProfileImageUrl())
			.subscriptionPlan("Basic")
			.emailVerified(false)
			.verificationToken(UUID.randomUUID().toString())
			.verificationExpires(LocalDateTime.now().plusHours(24))
			.build();
		
	}
	
	public void verifyEmail(String token) {
		log.info("Inside AuthService: verifyEmail(): {}", token);
		User user =  userRepository.findByVerificationToken(token)
			.orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));
		
		if (user.getVerificationExpires() != null && user.getVerificationExpires().isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Verification token has expired. Please request new one.");
		}
		
		user.setEmailVerified(true);
		user.setVerificationToken(null);
		user.setVerificationExpires(null);
		userRepository.save(user);
	}
	
	public AuthResponse login(LoginRequest request) {
		User existingUser = userRepository.findByEmail(request.getEmail())
			.orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
	}
}

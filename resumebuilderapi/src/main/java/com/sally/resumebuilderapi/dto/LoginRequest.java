package com.sally.resumebuilderapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginRequest {
	@Email(message = "이메일은 유효해야 합니다.")
	@NotBlank(message = "이메일 주소는 필수입니다.")
	private String email;
	
	@NotBlank(message = "비밀번호는 필수 입력 사항입니다.")
	private String password;
}
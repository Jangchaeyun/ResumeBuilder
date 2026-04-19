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
public class RegisterRequest {
	@Email(message = "이메일은 유효해야 합니다.")
	@NotBlank(message = "이메일 주소는 필수입니다.")
	private String email;
	
	@NotBlank(message = "이름은 필수 입력 사항입니다.")
	@Size(min = 2, max = 15, message = "이름은 2에서 15 사이여야 합니다.")
	private String name;
	
	@NotBlank(message = "비밀번호는 필수 입력 사항입니다.")
	@Size(min = 6, max = 15, message = "비밀번호는 6자에서 15자 사이여야 합니다.")
	private String password;
	
	private String profileImageUrl;
}

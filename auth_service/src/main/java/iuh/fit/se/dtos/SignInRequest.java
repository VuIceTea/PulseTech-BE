package iuh.fit.se.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
public class SignInRequest {
	@NotBlank(message = "Tên người dùng là bắt buộc!")
	private String userName;

	@NotBlank(message = "Mật khẩu là bắt buộc!")
	private String password;
}

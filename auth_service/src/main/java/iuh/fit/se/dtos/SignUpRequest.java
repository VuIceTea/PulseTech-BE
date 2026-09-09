package iuh.fit.se.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignUpRequest {
	@NotBlank(message = "Tên người dùng là bắt buộc!")
	@Size(min = 5, message = "Tên người dùng phải có ít nhất 5 ký tự!")
	@Size(max = 20, message = "Tên người dùng chỉ được tối đa 20 ký tự!")
	private String userName;

	@Email(message = "Email không đúng định dạng!")
	@NotBlank(message = "Email là bắt buộc!")
	private String email;

	@NotBlank(message = "Mật khẩu là bắt buộc!")
	@Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự!")
	@Size(max = 20, message = "Mật khẩu chỉ được tối đa 20 ký tự!")
	private String password;

	private Set<String> roles;
}

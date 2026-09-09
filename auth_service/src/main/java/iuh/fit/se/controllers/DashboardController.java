package iuh.fit.se.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
// @CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@RequestMapping("/api")
public class DashboardController {
	/**
	 * Trả về thông điệp chào mừng cho người dùng đã đăng nhập có vai trò:
	 * ROLE_USER, ROLE_ADMIN, hoặc ROLE_SUPER_ADMIN.
	 * 
	 * @param authentication đối tượng chứa thông tin người dùng hiện tại
	 * @return thông điệp chào mừng và danh sách quyền
	 */
	@PreAuthorize("hasAnyRole('SCOPE_ROLE_USER','SCOPE_ROLE_ADMIN','SCOPE_ROLE_SUPER_ADMIN')")
	@GetMapping("/welcome-message")
	public ResponseEntity<String> getFirstWelcomeMessage(Authentication authentication) {
		return ResponseEntity.ok("Welcome to user service: " + authentication.getName() + " with scope: "
				+ authentication.getAuthorities());
	}

	/**
	 * Trả về thông điệp dành riêng cho admin hoặc người có quyền UPDATE.
	 * Chỉ những người có vai trò ROLE_ADMIN, ROLE_SUPER_ADMIN hoặc quyền SCOPE_PERMISSION_UPDATE mới truy cập được.
	 * 
	 * @param authentication đối tượng xác thực hiện tại
	 * @param principal principal của người dùng (đại diện cho người dùng hiện tại)
	 * @return thông điệp dành cho admin
	 */
	@PreAuthorize("hasAnyRole('SCOPE_ROLE_ADMIN','SCOPE_ROLE_SUPER_ADMIN') "
			+ "or hasAuthority('SCOPE_PERMISSION_UPDATE')")
	@GetMapping("/admin-message")
	public ResponseEntity<String> getAdminData(Authentication authentication, Principal principal) {
		return ResponseEntity.ok("Welcome to Admin Role: " + authentication.getAuthorities());
	}
}

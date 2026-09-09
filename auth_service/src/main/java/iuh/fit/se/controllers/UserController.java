package iuh.fit.se.controllers;

import iuh.fit.se.dtos.UserDTO;
import iuh.fit.se.entities.LoginRequest;
import iuh.fit.se.entities.Role;
import iuh.fit.se.entities.User;
import iuh.fit.se.services.RoleService;
import iuh.fit.se.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {
	@Autowired
	private UserService userService;

	@Autowired
	private RoleService roleService;

	@GetMapping
	public ResponseEntity<Map<String, Object>> getAllUsers() {
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("status", HttpStatus.OK.value());
		List<UserDTO> users = userService.findAll();
		response.put("data", users);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	@PutMapping("/{id}/state")
	public ResponseEntity<Map<String, Object>> updateUserState(@PathVariable int id) {
		Map<String, Object> response = new LinkedHashMap<>();
		UserDTO userDTO = userService.findById(id);
		UserDTO updateUser = userService.updateState(userDTO);

		response.put("status", HttpStatus.OK.value());
		response.put("data", updateUser);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

//	@PutMapping("/{id}")
//	public ResponseEntity<Map<String, Object>> updateUser(@PathVariable int id, @Valid @RequestBody UserDTO userDTO,
//			BindingResult bindingResult) {
//		Map<String, Object> response = new LinkedHashMap<>();
//
//		if (bindingResult.hasErrors()) {
//			Map<String, Object> errors = new LinkedHashMap<>();
//			bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
//			response.put("status", HttpStatus.BAD_REQUEST.value());
//			response.put("errors", errors);
//			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//		}
//
//		response.put("status", HttpStatus.OK.value());
//		response.put("data", userService.updateUser(id, userDTO));
//		return ResponseEntity.status(HttpStatus.OK).body(response);
//	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable int id) {
		Map<String, Object> response = new LinkedHashMap<>();
		userService.delete(id);
		response.put("status", HttpStatus.OK.value());
		response.put("message", "User deleted successfully");
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

//	@PostMapping
//	public ResponseEntity<Map<String, Object>> saveUser(@Valid @RequestBody UserDTO userDTO,
//			BindingResult bindingResult) {
//		Map<String, Object> response = new LinkedHashMap<>();
//
//		if (bindingResult.hasErrors()) {
//			Map<String, Object> errors = new LinkedHashMap<>();
//			bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
//			response.put("status", HttpStatus.BAD_REQUEST.value());
//			response.put("errors", errors);
//			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//		}
//
//		response.put("status", HttpStatus.CREATED.value());
//		response.put("data", userService.saveUserDTO(userDTO));
//		return ResponseEntity.status(HttpStatus.CREATED).body(response);
//	}

	@PostMapping("/signup")
	public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user) {
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("status", HttpStatus.OK);
		response.put("data", userService.save(user));
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
		Map<String, Object> response = new LinkedHashMap<>();
		try {
			// Validate the input request
			if (request == null || request.getUserName() == null || request.getPassword() == null) {
				response.put("error", "Invalid login request");
				return ResponseEntity.badRequest().body(response);
			}

			// Attempt login
			if (userService.login(request)) {
				response.put("user", request.getUserName());
				response.put("status", HttpStatus.OK.value());
				return ResponseEntity.ok(response);
			} else {
				response.put("error", "Invalid username or password");
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
			}
		} catch (Exception e) {
			response.put("error", "Internal server error");
			response.put("details", e.getMessage());
			e.printStackTrace(); // Log the exception
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/**
	 * Thêm role cho user
	 * 
	 * @param id
	 * @param roleCode
	 * @return
	 */
	@PutMapping("/{id}/add-role")
	public ResponseEntity<?> addRoleToUser(@PathVariable int id, @RequestBody String roleCode) {
	    try {
	        System.out.println("Gọi API add-role với userId = " + id + ", roleCode = " + roleCode);

	        User user = userService.findEntityById(id);
	        Role role = roleService.getRoleByCode(roleCode.trim());

	        // So sánh role dựa trên code thay vì equals (tránh bug trùng khóa DB)
	        boolean hasRole = user.getRoles()
	                .stream()
	                .anyMatch(existing -> existing.getCode().equalsIgnoreCase(role.getCode()));

	        if (hasRole) {
	            return ResponseEntity.ok("User đã có role này.");
	        }

	        user.getRoles().add(role);
	        userService.save(user);

	        return ResponseEntity.ok("Đã thêm role cho user thành công.");
	    } catch (Exception ex) {
	        ex.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Lỗi server: " + ex.getMessage());
	    }
	}

	/*
	 * Kiểm tra user tồn tại
	 */
	@GetMapping("/check-username/{username}")
	public ResponseEntity<?> checkUsername(@PathVariable String username) {
		if (userService.existsByUserName(username)) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên đăng nhập đã tồn tại.");
		}
		return ResponseEntity.ok("Tên đăng nhập hợp lệ.");
	}
}

package iuh.fit.se.services.impl;

import iuh.fit.se.auths.UserPrincipal;
import iuh.fit.se.dtos.ApiResponse;
import iuh.fit.se.dtos.SignInRequest;
import iuh.fit.se.dtos.SignInResponse;
import iuh.fit.se.dtos.SignUpRequest;
import iuh.fit.se.dtos.UserProfileDTO;
import iuh.fit.se.entities.Role;
import iuh.fit.se.entities.Token;
import iuh.fit.se.entities.User;
import iuh.fit.se.enums.Gender;
import iuh.fit.se.enums.UserState;
import iuh.fit.se.exceptions.UserAlreadyExistsException;
import iuh.fit.se.services.AuthService;
import iuh.fit.se.services.RoleService;
import iuh.fit.se.services.TokenService;
import iuh.fit.se.services.UserService;
import iuh.fit.se.utils.JwtTokenUtil;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

	@Autowired
	private RestTemplate restTemplate;
	@Value("${user-service.url}") // http://api-gateway:8000/userProfiles
	private String userServiceUrl;

	private UserService userService;
	private RoleService roleService;
	private TokenService tokenService;
	private PasswordEncoder passwordEncoder;
	private JwtTokenUtil jwtTokenUtil;
	private AuthenticationManager authenticationManager;
	private JwtEncoder jwtEncoder;

	@Autowired
	public AuthServiceImpl(UserService userService, RoleService roleService, TokenService tokenService,
			JwtTokenUtil jwtTokenUtil, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
			JwtEncoder jwtEncoder) {
		this.userService = userService;
		this.roleService = roleService;
		this.tokenService = tokenService;
		this.jwtTokenUtil = jwtTokenUtil;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtEncoder = jwtEncoder;
	}

	/**
	 * Đăng ký tài khoản mới nếu username hoặc email chưa tồn tại.
	 * Sau khi tạo User, đồng thời gửi thông tin để tạo UserProfile ở user-service.
	 * 
	 * @param signUpRequest thông tin đăng ký người dùng
	 * @return ResponseEntity với thông báo thành công
	 * @throws UserAlreadyExistsException nếu username hoặc email đã tồn tại
	 */
	@Override
	public ResponseEntity<ApiResponse<?>> signUp(SignUpRequest signUpRequest) throws UserAlreadyExistsException {
		if (userService.existsByUserName(signUpRequest.getUserName())) {
			throw new UserAlreadyExistsException("Username already exist");
		}

		if (userService.existsByEmail(signUpRequest.getEmail())) {
			throw new UserAlreadyExistsException("Email already exist");
		}

		User user = createUser(signUpRequest);
		userService.saveUser(user);
		// return
		// ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.builder().status(String.valueOf("SUCCESS"))
		// .message("User account has been successfully created!").build());

		// Gửi API sang user-service
		createUserProfile(signUpRequest);

		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.builder()
				.status("SUCCESS")
				.message("User account has been successfully created!")
				.build());
	}

	/**
	 * Tạo đối tượng User từ thông tin đăng ký.
	 * Mã hóa mật khẩu và gán role.
	 * 
	 * @param signUpRequest thông tin đăng ký
	 * @return đối tượng User đã khởi tạo
	 */
	private User createUser(SignUpRequest signUpRequest) {
		return User.builder().email(signUpRequest.getEmail()).userName(signUpRequest.getUserName())
				.password(passwordEncoder.encode(signUpRequest.getPassword())).enabled(true)
				.roles(determineRoles(signUpRequest.getRoles())).build();
	}

	/**
	 * Xác định danh sách các role tương ứng từ danh sách tên role (string).
	 * Nếu không có role nào, gán mặc định ROLE_USER.
	 * 
	 * @param strRoles danh sách tên role
	 * @return tập hợp các đối tượng Role
	 */
	private Set<Role> determineRoles(Set<String> strRoles) {
		Set<Role> roles = new HashSet<>();

		if (strRoles == null) {
			roles.add(roleService.getRoleByCode("ROLE_USER"));
		} else {
			for (String role : strRoles) {
				roles.add(roleService.getRoleByCode(role));
			}
		}
		return roles;
	}

	/**
	 * Thực hiện đăng nhập người dùng với username và password.
	 * Xác thực bằng AuthenticationManager -> tạo JWT token và lưu vào bảng token.
	 * 
	 * @param signInRequest chứa username và password
	 * @return SignInResponse chứa thông tin token, user, role
	 */
	@Override
	public ResponseEntity<ApiResponse<?>> signIn(SignInRequest signInRequest) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(signInRequest.getUserName(), signInRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt = jwtTokenUtil.generateToken(authentication, jwtEncoder);
		UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
		User user = new User();
		user.setId(userDetails.getId());
		user.setUserName(userDetails.getUsername());

		Token token = Token.builder().token(jwt).user(user).expiryDate(jwtTokenUtil.generateExpirationDate())
				.revoked(false).build();
		tokenService.saveToken(token);

		SignInResponse signInResponse = SignInResponse.builder().username(userDetails.getUsername())
				.email(userDetails.getEmail()).id(userDetails.getId()).token(jwt).type("Bearer")
				.roles(userDetails.getAuthorities()).build();

		return ResponseEntity.ok(ApiResponse.builder().status("SUCCESS").message("Sign in successfull!")
				.response(signInResponse).build());
	}

	/**
	 * Gửi API sang user-service để tạo UserProfile tương ứng với email.
	 * Dùng RestTemplate để gọi API bên ngoài.
	 * 
	 * @param req chứa thông tin đăng ký để tạo profile
	 */
	private void createUserProfile(SignUpRequest req) {
		UserProfileDTO profileDTO = UserProfileDTO.builder()
				.fullName("")
				.email(req.getEmail())
				.phoneNumber("")
				.address("")
				.gender(Gender.MALE)
				.userState(UserState.ACTIVE)
				.url("")
				.build();

		try {
			restTemplate.postForEntity(userServiceUrl, profileDTO, Void.class);
		} catch (Exception ex) {
			log.error("Không thể tạo UserProfile: {}", ex.getMessage());
		}
	}
}

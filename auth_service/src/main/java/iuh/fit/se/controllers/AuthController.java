package iuh.fit.se.controllers;

import iuh.fit.se.dtos.ApiResponse;
import iuh.fit.se.dtos.SignInRequest;
import iuh.fit.se.dtos.SignUpRequest;
import iuh.fit.se.exceptions.UserAlreadyExistsException;
import iuh.fit.se.services.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
// @CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AuthController {
	private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
	private final AuthService authService;

	@Autowired
	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/sign-up")
	public ResponseEntity<ApiResponse<?>> registerUser(@RequestBody @Valid SignUpRequest signUpRequest)
			throws UserAlreadyExistsException {
		return authService.signUp(signUpRequest);
	}

	@PostMapping("/sign-in")
	public ResponseEntity<ApiResponse<?>> signInUser(@RequestBody @Valid SignInRequest signInRequest) {
		return authService.signIn(signInRequest);
	}
}

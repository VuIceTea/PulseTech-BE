package iuh.fit.se.services;

import iuh.fit.se.dtos.ApiResponse;
import iuh.fit.se.dtos.SignInRequest;
import iuh.fit.se.dtos.SignUpRequest;
import iuh.fit.se.exceptions.UserAlreadyExistsException;
import org.springframework.http.ResponseEntity;

public interface AuthService {
	ResponseEntity<ApiResponse<?>> signUp(SignUpRequest signUpRequest) throws UserAlreadyExistsException;

	ResponseEntity<ApiResponse<?>> signIn(SignInRequest signInRequest);
}

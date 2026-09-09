package iuh.fit.se.exceptions;

public class UserAlreadyExistsException extends Exception {
	public UserAlreadyExistsException(String message) {
		super(message);
	}
}
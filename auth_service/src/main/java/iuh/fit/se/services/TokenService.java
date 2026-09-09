package iuh.fit.se.services;

import iuh.fit.se.entities.Token;

public interface TokenService {
	void saveToken(Token token);

	Token findByToken(String token);
}

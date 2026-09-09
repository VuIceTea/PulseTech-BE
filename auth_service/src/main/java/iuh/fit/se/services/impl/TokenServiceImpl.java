package iuh.fit.se.services.impl;

import iuh.fit.se.auths.UserPrincipal;
import iuh.fit.se.entities.Token;
import iuh.fit.se.repositories.TokenRepository;
import iuh.fit.se.services.PermissionService;
import iuh.fit.se.services.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class TokenServiceImpl implements TokenService {

	private TokenRepository tokenRepository;

	@Autowired
	public TokenServiceImpl(TokenRepository tokenRepository) {
		this.tokenRepository = tokenRepository;
	}

	@Override
	public void saveToken(Token token) {
		tokenRepository.save(token);
	}

	@Override
	public Token findByToken(String token) {
		return tokenRepository.findByToken(token);
	}
}

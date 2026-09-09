package iuh.fit.se.services;

import iuh.fit.se.dtos.UserDTO;
import iuh.fit.se.entities.LoginRequest;
import iuh.fit.se.entities.User;

import java.util.List;

public interface UserService {
	User findByUserName(String userName);

	void saveUser(User user);

	boolean existsByEmail(String email);

	List<UserDTO> findAll();

	UserDTO findById(int id);

	UserDTO updateState(UserDTO userDTO);

//	UserDTO updateUser(int id, UserDTO userDTO);

	void delete(int id);
	
	boolean existsByUserName(String userName);

	User save(User user);

//	UserDTO saveUserDTO(UserDTO userDTO);

	boolean login(LoginRequest request);
	
	User findEntityById(int id);
}

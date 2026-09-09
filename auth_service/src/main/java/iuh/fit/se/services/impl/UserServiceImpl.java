package iuh.fit.se.services.impl;

import iuh.fit.se.dtos.UserDTO;
import iuh.fit.se.entities.LoginRequest;
import iuh.fit.se.entities.User;
import iuh.fit.se.enums.UserState;
import iuh.fit.se.repositories.UserRepository;
import iuh.fit.se.services.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;

	@Autowired
	public UserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public User findByUserName(String userName) {
		return userRepository.findByUserName(userName)
				.orElseThrow(() -> new UsernameNotFoundException("User Not Found with userName: " + userName));
	}

	@Transactional
	@Modifying
	@Override
	public void saveUser(User user) {
		userRepository.save(user);
	}

	@Override
	public boolean existsByEmail(String email) {
		return userRepository.existsByEmail(email);
	}

	@Override
	public List<UserDTO> findAll() {
		return userRepository.findAll().stream()
				.map(this::userToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public UserDTO findById(int id) {
		return userRepository.findById((long) id)
				.map(this::userToDTO)
				.orElseThrow(() -> new UsernameNotFoundException("User Not Found with id: " + id));
	}

	/**
	 * Cập nhật trạng thái kích hoạt (ACTIVE/INACTIVE) cho user
	 */
	@Override
	public UserDTO updateState(UserDTO userDTO) {
		User user = userRepository.findById((long) userDTO.getId())
				.orElseThrow(() -> new UsernameNotFoundException("User Not Found with id: " + userDTO.getId()));

		user.setEnabled(userDTO.getUserState() == UserState.ACTIVE);

		userRepository.save(user);
		return userToDTO(user);
	}

//	/**
//	 * Cập nhật thông tin user (bao gồm cả role)
//	 */
//	@Override
//	public UserDTO updateUser(int id, UserDTO userDTO) {
//		User user = userRepository.findById((long) id)
//				.orElseThrow(() -> new UsernameNotFoundException("User Not Found with id: " + id));
//
//		user.setUserName(userDTO.getFullName());
//		user.setEmail(userDTO.getEmail());
//		user.setPassword(userDTO.getPassword());
//		user.setEnabled(userDTO.getUserState() == UserState.ACTIVE);
//
//		/** GÁN ROLE CHO USER (THAY THẾ TOÀN BỘ ROLE HIỆN CÓ) */
//		if (userDTO.getRole() != null) {
//			user.setRoles(Set.of(userDTO.getRole()));
//		}
//
//		userRepository.save(user);
//		return userToDTO(user);
//	}

	@Override
	public void delete(int id) {
		if (!userRepository.existsById((long) id)) {
			throw new UsernameNotFoundException("User Not Found with id: " + id);
		}
		userRepository.deleteById((long) id);
	}

	@Override
	public boolean existsByUserName(String username) {
		return userRepository.existsByUserName(username);
	}

	@Override
	public User save(User user) {
		return userRepository.save(user);
	}

//	@Override
//	public UserDTO saveUserDTO(UserDTO userDTO) {
//		User user = new User();
//		user.setUserName(userDTO.getFullName());
//		user.setEmail(userDTO.getEmail());
//		user.setPassword(userDTO.getPassword());
//		user.setEnabled(userDTO.getUserState() == UserState.ACTIVE);
//
//		if (userDTO.getRole() != null) {
//			user.setRoles(Set.of(userDTO.getRole()));
//		}
//
//		User savedUser = userRepository.save(user);
//		return userToDTO(savedUser);
//	}

	/**
	 * Kiểm tra đăng nhập đơn giản (không mã hóa mật khẩu)
	 */
	@Override
	public boolean login(LoginRequest request) {
		Optional<User> user = userRepository.findByUserName(request.getUserName());
		return user.map(value -> value.getPassword().equals(request.getPassword()))
				.orElse(false);
	}

	/**
	 * Chuyển User entity sang DTO
	 */
	private UserDTO userToDTO(User user) {
	    List<UserDTO.RoleDTO> authorities = user.getRoles().stream()
	            .flatMap(role -> role.getPermissions().stream()
	                    .map(permission -> UserDTO.RoleDTO.builder()
	                            .authority(permission.getCode())
	                            .build()))
	            .collect(Collectors.toList());

	    // Thêm Role vào list
	    authorities.addAll(user.getRoles().stream()
	            .map(role -> UserDTO.RoleDTO.builder()
	                    .authority(role.getCode())
	                    .build())
	            .toList());

	    return UserDTO.builder()
	            .id(user.getId() != null ? user.getId().intValue() : 0)
	            .username(user.getUserName())
	            .email(user.getEmail())
	            .roles(authorities)
	            .userState(user.isEnabled() ? UserState.ACTIVE : UserState.INACTIVE)
	            .build();
	}
	
	/**
	 * Lấy User entity theo ID (trả về entity)
	 */
	@Override
	public User findEntityById(int id) {
		return userRepository.findById((long) id)
				.orElseThrow(() -> new UsernameNotFoundException("User Not Found with id: " + id));
	}

}
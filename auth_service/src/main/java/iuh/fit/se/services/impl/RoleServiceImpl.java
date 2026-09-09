package iuh.fit.se.services.impl;

import iuh.fit.se.entities.Role;
import iuh.fit.se.repositories.RoleRepository;
import iuh.fit.se.services.RoleService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

	private RoleRepository roleRepository;

	@Autowired
	public RoleServiceImpl(RoleRepository roleRepository) {
		this.roleRepository = roleRepository;
	}

	@Transactional
	@Modifying
	@Override
	public void saveRole(Role role) {
		roleRepository.save(role);
	}

	@Override
	public List<Role> getAllRoles() {
		return roleRepository.findAll();
	}

	@Override
	public Role getRoleByCode(String roleCode) {
		return roleRepository.findByCode(roleCode);
	}
}

package iuh.fit.se.services;

import iuh.fit.se.entities.Role;

import java.util.List;

public interface RoleService {
	void saveRole(Role role);

	List<Role> getAllRoles();

	Role getRoleByCode(String roleCode);
}

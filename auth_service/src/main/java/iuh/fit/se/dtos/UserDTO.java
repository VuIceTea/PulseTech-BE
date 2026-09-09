package iuh.fit.se.dtos;

import java.util.List;

import iuh.fit.se.enums.UserState;
import lombok.*;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private int id;
    private String username;
    private String email;
    private List<RoleDTO> roles;
    private UserState userState;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleDTO {
        private String authority;
    }
}
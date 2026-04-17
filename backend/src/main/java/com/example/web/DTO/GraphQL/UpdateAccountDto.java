package com.example.web.DTO.GraphQL;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateAccountDto {
    private String nickname;
    private String email;
    private String currentPassword;
    private String newPassword;
}

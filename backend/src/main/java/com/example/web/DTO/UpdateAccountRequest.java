package com.example.web.DTO;

import lombok.Data;

@Data
public class UpdateAccountRequest {
    private String nickname;
    private String email;
    private String currentPassword; // required when changing email
    private String password;        // new password
}

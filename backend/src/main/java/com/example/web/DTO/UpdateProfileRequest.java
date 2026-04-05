package com.example.web.DTO;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String aboutMe; // the only field that can be updated via /me/profile
}

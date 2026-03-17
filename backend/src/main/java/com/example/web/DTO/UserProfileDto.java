package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileDto { // for /users/{id}/profile (about me)
    private Long id;
    private String aboutMe;
}

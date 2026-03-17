package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryDto { //for users/{id} (name + profile pic)
    private Long id;
    private String nickname;
    private String profilePictureUrl;
}

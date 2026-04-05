package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryDto { //for users/{id} (name + profile pic + links to sub-resources)
    private Long id;
    private String nickname;
    private String profilePictureUrl;
    private String profileUrl;
    private String bioUrl;
}

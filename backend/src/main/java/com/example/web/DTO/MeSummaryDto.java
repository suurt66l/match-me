package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MeSummaryDto { // for GET /api/me — own profile only, includes email
    private Long id;
    private String nickname;
    private String profilePictureUrl;
    private String email;
}

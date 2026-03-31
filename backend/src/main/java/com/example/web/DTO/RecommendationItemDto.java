package com.example.web.DTO;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class RecommendationItemDto {
    private Long id;
    private String nickname;
    private String avatarUrl;
    private String country;
    private LocalDate dateOfBirth;
    private String games;
    private String gameGenres;
    private String platform;
    private String lookingFor;
    private String intensity;
    private String timeRange;
    private String aboutMe;
    private List<String> matchedFields;
    private double score; // used for sorting, not sent to frontend ideally but harmless
}

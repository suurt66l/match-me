package com.example.web.DTO;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor  // ← generates the constructor you need
public class RecommendationItemDto {
    private Long id;
    private String games;            // maps to gamePreference
    private String gameGenres;       // maps to gameGenrePreference
    private String platform;         // maps to platforms
    private String lookingFor;
    private String intensity;
    private String country;          // maps to location
    private LocalDate dateOfBirth;
    private double score;
}

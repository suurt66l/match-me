package com.example.web.DTO.GraphQL;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserBioDto { 
    private LocalDate dateOfBirth;
    private String gender;
    private String country;
    private String city;
    private String timeRange;
    private String timeZone;
    private String gamePreference;
    private String gameGenrePreference;
    private String lookingFor;
    private String platforms; 
    private String intensity;
    private String preferredGenders;
    private Integer preferredAgeMin;
    private Integer preferredAgeMax;
    private Integer maxDistanceKm;
    private Long userId;
}

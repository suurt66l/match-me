package com.example.web.DTO.GraphQL;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserPreferencesDto {
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
}

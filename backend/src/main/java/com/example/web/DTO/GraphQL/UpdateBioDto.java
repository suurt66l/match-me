package com.example.web.DTO.GraphQL;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateBioDto {
    private String dateOfBirth;
    private String gender;
    private String country;
    private String city;
    private Double latitude;
    private Double longitude;
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

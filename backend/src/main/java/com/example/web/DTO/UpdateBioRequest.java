package com.example.web.DTO;

import java.time.LocalDate;

import lombok.Data;

@Data
public class UpdateBioRequest {
    private String gender;
    private LocalDate dateOfBirth;
    private String timezone;
    private String timeRange;
    private String gamePreference;
    private String gameGenrePreference;
    private String lookingFor;
    private String platforms; 
    private String intensity;
    private String location;
    private String country;
    private String city;
    private Double latitude;
    private Double longitude;
    private Integer maxDistanceKm;
    private String preferredGenders;
    private Integer preferredAgeMin;
    private Integer preferredAgeMax;
}

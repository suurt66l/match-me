package com.example.web.Entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column (nullable = false)
    private String nickname;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String timezone;
    private String timeRange;
    private String gamePreference; // specific game preference
    private String gameGenrePreference; // genre preference
    private String lookingFor; // e.g "just gaming, friendship, relationship, etc"
    private String platforms; // PC, Xbox, etc
    private String intensity; // gaming intensity, e.g. casual to sweaty
    private String country;   // country name (shown on profile)
    private String city;      // city name (shown on profile)
    private Double latitude;  // GPS coordinates for proximity matching
    private Double longitude;
    private Integer maxDistanceKm; // max distance the user is willing to match within (null = no limit)
    private String openToOtherRegions; // legacy, unused
    private String preferredGenders;   // comma-separated genders the user wants to match with (null = any)
    private Integer preferredAgeMin;   // minimum age of preferred match (null = no limit)
    private Integer preferredAgeMax;   // maximum age of preferred match (null = no limit)

    private String profilePictureUrl;

    @Column(length=2000)
    private String aboutMe; 
}
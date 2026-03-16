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
    private String location;

    private String profilePictureUrl; 

    @Column(length=2000)
    private String aboutMe; 
}
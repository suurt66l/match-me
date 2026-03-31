package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ConnectionUserDto {
    private Long connectionId;
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
}

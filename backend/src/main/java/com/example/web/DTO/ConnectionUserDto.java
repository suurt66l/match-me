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
}

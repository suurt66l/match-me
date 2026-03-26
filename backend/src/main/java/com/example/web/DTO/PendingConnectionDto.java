package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PendingConnectionDto {
    private Long connectionId;   // needed to accept or reject
    private Long requesterId;    // who sent the request
    private String nickname;
    private String avatarUrl;
    private String country;
    private LocalDate dateOfBirth;
}
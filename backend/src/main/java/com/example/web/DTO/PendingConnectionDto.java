package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PendingConnectionDto {
    private Long connectionId;   // needed to accept or reject
    private Long requesterId;    // who sent the request
    private String nickname;     // their name
    private String avatarUrl;    // their picture
}
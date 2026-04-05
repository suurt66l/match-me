package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PendingConnectionIdDto {
    private Long connectionId; // ID of the Connection record (needed to accept/reject)
    private Long userId;       // ID of the other user (fetch their profile via /users/{id})
}

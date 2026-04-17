package com.example.web.DTO.GraphQL;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatusUpdateDto {
    private Long userId;
    private Boolean isOnline;
}

package com.example.web.DTO.GraphQL;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OnlineStatusDto {
    private Long id;
    private Boolean isOnline;
}

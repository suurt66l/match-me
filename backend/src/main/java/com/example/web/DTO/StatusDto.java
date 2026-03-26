package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatusDto {
    private Long userId;
    private boolean online;
}
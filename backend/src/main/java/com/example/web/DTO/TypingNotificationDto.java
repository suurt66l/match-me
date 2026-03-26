package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TypingNotificationDto {
    private Long senderId;
    private boolean typing;
}
package com.example.web.DTO;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto { //for WebSocket delivery and REST responses
    private Long id;
    private Long senderId;
    private Long recipientId;
    private String content;
    private LocalDateTime timestamp;
    private boolean read;
}

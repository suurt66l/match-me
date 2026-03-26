package com.example.web.DTO;

import lombok.Data;

@Data
public class ChatMessageDto { //payload for sending a message via WebSocket
    private Long recipientId;
    private String content;
}

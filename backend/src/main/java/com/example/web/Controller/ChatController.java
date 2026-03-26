package com.example.web.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import com.example.web.DTO.ChatMessageDto;
import com.example.web.Service.ChatService;

@Controller
public class ChatController { // websocket controller for sending messages
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDto messageDto,
                            SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        String senderEmail = auth.getName();
        chatService.sendMessage(senderEmail, messageDto.getRecipientId(), messageDto.getContent());
    }
    

}

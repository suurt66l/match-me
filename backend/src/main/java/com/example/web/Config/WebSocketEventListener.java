package com.example.web.Config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.example.web.DTO.StatusDto;
import com.example.web.Repository.UserRepository;

@Component
public class WebSocketEventListener {
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;
        String email = accessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user ->
            messagingTemplate.convertAndSend("/topic/status", new StatusDto(user.getId(), true))
        );
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;
        String email = accessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user ->
            messagingTemplate.convertAndSend("/topic/status", new StatusDto(user.getId(), false))
        );
    }
}

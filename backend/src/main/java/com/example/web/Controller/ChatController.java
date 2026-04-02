package com.example.web.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import com.example.web.DTO.ChatMessageDto;
import com.example.web.DTO.ReadDto;
import com.example.web.DTO.StatusDto;
import com.example.web.DTO.TypingDto;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ChatService;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.OnlineStatusRegistry;

/**
 * Handles all real-time WebSocket messages from clients.
 * Methods here are triggered when the frontend publishes to /app/<destination>.
 * The authenticated user is read from the WebSocket session, not from the payload,
 * so clients cannot impersonate each other.
 */
@Controller
public class ChatController {
    private final ChatService chatService;
    private final OnlineStatusRegistry onlineStatusRegistry;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConnectionService connectionService;

    public ChatController(ChatService chatService, OnlineStatusRegistry onlineStatusRegistry, UserRepository userRepository, SimpMessagingTemplate messagingTemplate, ConnectionService connectionService) {
        this.chatService = chatService;
        this.onlineStatusRegistry = onlineStatusRegistry;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.connectionService = connectionService;
    }

    // Frontend publishes to /app/chat.send to send a message
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDto messageDto,
                            SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        chatService.sendMessage(auth.getName(), messageDto.getRecipientId(), messageDto.getContent());
    }

    // Frontend publishes to /app/chat.typing when user is typing or stopped typing
    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingDto typingDto,
                       SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        chatService.sendTypingNotification(auth.getName(), typingDto.getRecipientId(), typingDto.isTyping());
    }

    // Frontend publishes to /app/chat.read when the user opens a chat or receives a message.
    // This marks the sender's messages as read and sends a read receipt back to them (✓✓).
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ReadDto readDto,
                           SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        chatService.markMessagesAsRead(auth.getName(), readDto.getSenderId());
    }

    // Frontend publishes to /app/status.request after subscribing to /user/queue/status.
    // The backend responds by sending the current online status of each of the user's connections.
    // This is needed because the connect event fires before subscriptions are ready.
    @MessageMapping("/status.request")
    public void requestStatuses(SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        userRepository.findByEmail(auth.getName()).ifPresent(user ->
            connectionService.getAcceptedConnectionIds(user).forEach(connId ->
                messagingTemplate.convertAndSendToUser(
                    auth.getName(),
                    "/queue/status",
                    new StatusDto(connId, onlineStatusRegistry.isOnline(connId))
                )
            )
        );
    }

    // Frontend publishes to /app/chat.offline just before closing the WebSocket (on logout).
    // This ensures offline is broadcast immediately without waiting for disconnect detection.
    @MessageMapping("/chat.offline")
    public void goOffline(SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        userRepository.findByEmail(auth.getName()).ifPresent(user -> {
            onlineStatusRegistry.setOffline(user.getId());
            // Notify only accepted connections — same targeted approach as the event listener
            connectionService.getAcceptedConnectionIds(user).forEach(connId ->
                userRepository.findById(connId).ifPresent(other ->
                    messagingTemplate.convertAndSendToUser(
                        other.getEmail(),
                        "/queue/status",
                        new StatusDto(user.getId(), false)
                    )
                )
            );
        });
    }
}

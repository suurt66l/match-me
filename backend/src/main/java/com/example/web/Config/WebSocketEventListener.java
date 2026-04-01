package com.example.web.Config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.example.web.DTO.StatusDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.OnlineStatusRegistry;

/**
 * Listens for WebSocket connect/disconnect events fired by Spring automatically.
 * Notifies only the user's accepted connections — not all users on the server.
 */
@Component
public class WebSocketEventListener {
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final OnlineStatusRegistry onlineStatusRegistry;
    private final ConnectionService connectionService;

    public WebSocketEventListener(UserRepository userRepository, SimpMessagingTemplate messagingTemplate, OnlineStatusRegistry onlineStatusRegistry, ConnectionService connectionService) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.onlineStatusRegistry = onlineStatusRegistry;
        this.connectionService = connectionService;
    }

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;
        String email = accessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            onlineStatusRegistry.setOnline(user.getId());
            // Send online notification only to this user's accepted connections
            notifyConnections(user, true);
        });
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;
        String email = accessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            onlineStatusRegistry.setOffline(user.getId());
            // Send offline notification only to this user's accepted connections
            notifyConnections(user, false);
        });
    }

    // Sends a status update to each of the user's accepted connections via their private queue.
    // This ensures strangers never learn about this user's online/offline status.
    private void notifyConnections(User user, boolean online) {
        for (Connection conn : connectionService.getAcceptedConnections(user)) {
            // Get the other person in this connection (not the user who changed status)
            User other = conn.getRequester().getId().equals(user.getId())
                    ? conn.getAddressee()
                    : conn.getRequester();
            messagingTemplate.convertAndSendToUser(
                    other.getEmail(),
                    "/queue/status",
                    new StatusDto(user.getId(), online)
            );
        }
    }
}

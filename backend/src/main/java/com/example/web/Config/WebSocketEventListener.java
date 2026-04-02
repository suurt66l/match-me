package com.example.web.Config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.example.web.DTO.StatusDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.OnlineStatusRegistry;

/**
 * Listens for WebSocket connect/disconnect events that Spring fires automatically.
 *
 * When a user opens the app, their browser establishes a WebSocket connection.
 * When they close the tab or log out, the connection closes.
 * Spring detects both events and calls the methods below.
 *
 * On each event we:
 *   1. Update the in-memory OnlineStatusRegistry (who is currently online)
 *   2. Notify only that user's accepted connections — not everyone on the server —
 *      so users can't find out who is online unless they are already friends.
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

    /**
     * Fires when a user's browser successfully opens a WebSocket connection.
     * We add them to the online registry and tell their friends they came online.
     */
    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        // StompHeaderAccessor lets us read the headers from the CONNECT frame,
        // including the authenticated user that our JWT interceptor attached
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;
        String email = accessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            onlineStatusRegistry.setOnline(user.getId());
            notifyConnections(user, true);
        });
    }

    /**
     * Fires when a user's WebSocket connection closes (clean logout/navigation).
     * For hard tab closes (browser killed), this is triggered via the sendBeacon
     * REST endpoint instead — see ChatHistoryController.goOffline().
     */
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) return;
        String email = accessor.getUser().getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            onlineStatusRegistry.setOffline(user.getId());
            notifyConnections(user, false);
        });
    }

    /**
     * Pushes an online/offline status update to each of the given user's accepted connections.
     *
     * convertAndSendToUser sends to a specific user's private queue — only they receive it.
     * The destination "/queue/status" is prefixed with "/user/" internally by Spring,
     * so the full destination becomes "/user/{email}/queue/status".
     */
    private void notifyConnections(User user, boolean online) {
        connectionService.getAcceptedConnectionIds(user).forEach(connId ->
            userRepository.findById(connId).ifPresent(other ->
                messagingTemplate.convertAndSendToUser(
                    other.getEmail(),
                    "/queue/status",
                    new StatusDto(user.getId(), online)
                )
            )
        );
    }
}

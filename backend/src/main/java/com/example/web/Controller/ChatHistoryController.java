package com.example.web.Controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.MessageDto;
import com.example.web.DTO.ReadReceiptDto;
import com.example.web.Entity.Message;
import com.example.web.Entity.User;
import com.example.web.Repository.MessageRepository;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ChatService;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.OnlineStatusRegistry;

import java.util.Set;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final OnlineStatusRegistry onlineStatusRegistry;
    private final ConnectionService connectionService;

    public ChatHistoryController(ChatService chatService, UserRepository userRepository, MessageRepository messageRepository, SimpMessagingTemplate messagingTemplate, OnlineStatusRegistry onlineStatusRegistry, ConnectionService connectionService) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
        this.onlineStatusRegistry = onlineStatusRegistry;
        this.connectionService = connectionService;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<Page<MessageDto>> getConversation(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = getCurrentUser();
        Page<Message> messagePage = chatService.getConversation(currentUser, userId, page, size);
        Page<MessageDto> dtoPage = messagePage.map(this::convertToDto);
        return ResponseEntity.ok(dtoPage);
        }

    @GetMapping("/online")
    public ResponseEntity<Set<Long>> getOnlineUsers() {
        User currentUser = getCurrentUser();
        List<Long> connectionIds = connectionService.getAcceptedConnectionIds(currentUser);
        Set<Long> onlineConnectionIds = connectionIds.stream()
                .filter(onlineStatusRegistry::isOnline)
                .collect(java.util.stream.Collectors.toSet());
        return ResponseEntity.ok(onlineConnectionIds);
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<Long, Long>> getUnreadCounts() {
        User currentUser = getCurrentUser();
        List<Object[]> rows = messageRepository.countUnreadGroupedBySender(currentUser);
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        return ResponseEntity.ok(counts);
    }

    @PutMapping("/read/{userId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        messageRepository.markAsRead(currentUser, sender);
        // Notify the sender that their messages were read
        messagingTemplate.convertAndSendToUser(
            sender.getEmail(),
            "/queue/read-receipts",
            new ReadReceiptDto(currentUser.getId())
        );
        return ResponseEntity.noContent().build();
    }

    private MessageDto convertToDto(Message message) {
        return new MessageDto(
            message.getId(),
            message.getSender().getId(),
            message.getRecipient().getId(),
            message.getContent(),
            message.getTimestamp(),
            message.isRead()
        );
    }

}

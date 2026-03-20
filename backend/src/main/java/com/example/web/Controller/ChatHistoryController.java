package com.example.web.Controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.MessageDto;
import com.example.web.Entity.Message;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatHistoryController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
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

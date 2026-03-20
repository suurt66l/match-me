package com.example.web.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.MessageDto;
import com.example.web.Entity.Message;
import com.example.web.Entity.User;
import com.example.web.Repository.MessageRepository;
import com.example.web.Repository.UserRepository;

@Service
public class ChatService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConnectionService connectionService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(MessageRepository messageRepository,
                        UserRepository userRepository,
                        ConnectionService connectionService,
                        SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.connectionService = connectionService;
        this.messagingTemplate = messagingTemplate;
                        }
    
    @Transactional
    public Message sendMessage(String senderEmail, Long recipientId, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));
        
        // Only connected users can chat
        if (!connectionService.areConnected(sender, recipient)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not connected to this user");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        message.setRead(false);
        Message saved = messageRepository.save(message);

        // Convert to DTO for real time delivery
        MessageDto dto = new MessageDto(
            saved.getId(),
            sender.getId(),
            recipient.getId(),
            saved.getContent(),
            saved.getTimestamp(),
            saved.isRead()
        );

        //send to recipient's personal queue
        messagingTemplate.convertAndSendToUser(
            recipient.getEmail(), 
            "/queue/messages", 
            dto);
        
            return saved;
    }

    public Page<Message> getConversation(User currentUser, Long otherUserId, int page, int size) {
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!connectionService.areConnected(currentUser, otherUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not connected to this user");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return messageRepository.findConversation(currentUser, otherUser, pageable);
    }
}

package com.example.web.Controller;

import com.example.web.DTO.IdDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ConnectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;
    private final UserRepository userRepository;

    public ConnectionController(ConnectionService connectionService, UserRepository userRepository) {
        this.connectionService = connectionService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // POST /api/connections/request/{userId}
    @PostMapping("/request/{userId}")
    public ResponseEntity<Void> sendRequest(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        connectionService.sendRequest(currentUser, userId);
        return ResponseEntity.ok().build();
    }

    // PUT /api/connections/accept/{connectionId}
    @PutMapping("/accept/{connectionId}")
    public ResponseEntity<Void> acceptRequest(@PathVariable Long connectionId) {
        User currentUser = getCurrentUser();
        connectionService.acceptRequest(currentUser, connectionId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/connections/reject/{connectionId}
    @DeleteMapping("/reject/{connectionId}")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long connectionId) {
        User currentUser = getCurrentUser();
        connectionService.rejectOrCancel(currentUser, connectionId);
        return ResponseEntity.noContent().build();
    }

    // POST /api/connections/block/{userId}
    @PostMapping("/block/{userId}")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        connectionService.blockUser(currentUser, userId);
        return ResponseEntity.ok().build();
    }

    // GET /api/connections (returns list of accepted connection IDs)
    @GetMapping
    public ResponseEntity<List<IdDto>> getConnections() {
        User currentUser = getCurrentUser();
        List<Long> connectedIds = connectionService.getAcceptedConnectionIds(currentUser);
        List<IdDto> result = connectedIds.stream()
                .map(IdDto::new)
                .toList();
        return ResponseEntity.ok(result);
    }
}
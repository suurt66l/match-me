package com.example.web.Controller;

import com.example.web.DTO.ConnectionUserDto;
import com.example.web.DTO.PendingConnectionDto;
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

    // DELETE /api/connections/dismiss/{connectionId}
    @DeleteMapping("/dismiss/{connectionId}")
    public ResponseEntity<Void> dismissConnection(@PathVariable Long connectionId) {
        User currentUser = getCurrentUser();
        connectionService.dismissAccepted(currentUser, connectionId);
        return ResponseEntity.noContent().build();
    }

    // GET /api/connections — returns accepted connections with full user info
    @GetMapping
    public ResponseEntity<List<ConnectionUserDto>> getConnections() {
        User currentUser = getCurrentUser();
        List<ConnectionUserDto> result = connectionService.getAcceptedConnections(currentUser)
                .stream()
                .map(conn -> {
                    // Return the OTHER user's info (not the current user)
                    User other = conn.getRequester().getId().equals(currentUser.getId())
                            ? conn.getAddressee()
                            : conn.getRequester();
                    return new ConnectionUserDto(
                            conn.getId(),
                            other.getId(),
                            other.getNickname(),
                            other.getProfilePictureUrl(),
                            other.getLocation(),
                            other.getDateOfBirth()
                    );
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    // GET /api/connections/pending — returns incoming pending requests
    @GetMapping("/pending")
    public ResponseEntity<List<PendingConnectionDto>> getPendingConnections() {
        User currentUser = getCurrentUser();
        List<PendingConnectionDto> result = connectionService.getPendingIncomingConnections(currentUser)
                .stream()
                .map(conn -> new PendingConnectionDto(
                        conn.getId(),
                        conn.getRequester().getId(),
                        conn.getRequester().getNickname(),
                        conn.getRequester().getProfilePictureUrl(),
                        conn.getRequester().getLocation(),
                        conn.getRequester().getDateOfBirth()
                ))
                .toList();
        return ResponseEntity.ok(result);
    }

    // GET /api/connections/pending/sent — returns outgoing pending requests
    @GetMapping("/pending/sent")
    public ResponseEntity<List<PendingConnectionDto>> getSentConnections() {
        User currentUser = getCurrentUser();
        List<PendingConnectionDto> result = connectionService.getPendingOutgoingConnections(currentUser)
                .stream()
                .map(conn -> new PendingConnectionDto(
                        conn.getId(),
                        conn.getAddressee().getId(),
                        conn.getAddressee().getNickname(),
                        conn.getAddressee().getProfilePictureUrl(),
                        conn.getAddressee().getLocation(),
                        conn.getAddressee().getDateOfBirth()
                ))
                .toList();
        return ResponseEntity.ok(result);
    }
}
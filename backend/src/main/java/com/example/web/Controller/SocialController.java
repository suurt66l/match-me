package com.example.web.Controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.IdDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.MatchingService;
import com.example.web.Service.ConnectionService;

@RestController
@RequestMapping("/api")
public class SocialController {
    private final UserRepository userRepository;
    private final MatchingService matchingService;
    private final ConnectionService connectionService;

    public SocialController(UserRepository userRepository, MatchingService matchingService, ConnectionService connectionService) {
        this.userRepository = userRepository;
        this.matchingService = matchingService;
        this.connectionService = connectionService;
    }

    private boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    //GET /recommendations
    @GetMapping("/recommendations")
    public ResponseEntity<List<IdDto>> getRecommendations() {
        if (!isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        User currentUser = getCurrentUser();
        List<Long> recommendedIds = matchingService.getRecommendations(currentUser.getId());
        List<IdDto> result = recommendedIds.stream()
                    .map(IdDto::new)
                    .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // GET /connections
    @GetMapping("/connections")
    public ResponseEntity<List<IdDto>> getConnections() {
        if (!isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        User currentUser = getCurrentUser();
        List<Long> connectedIds = connectionService.getAcceptedConnectionIds(currentUser);
        List<IdDto> result = connectedIds.stream()
                    .map(IdDto::new)
                    .toList();
        return ResponseEntity.ok(result);
    }
}

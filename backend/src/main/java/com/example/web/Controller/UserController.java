package com.example.web.Controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.PublicUserBioDto;
import com.example.web.DTO.UserProfileDto;
import com.example.web.DTO.UserSummaryDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.ConnectionStatus;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Security.JwtUtil;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.MatchingService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ConnectionService connectionService;
    private final MatchingService matchingService;

    public UserController(UserRepository userRepository, JwtUtil jwtUtil, ConnectionService connectionService, MatchingService matchingService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.connectionService = connectionService;
        this.matchingService = matchingService;
    }

    // Returns the current authenticated user, or throws 404 if not authenticated
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

    // Returns true if the viewer is allowed to see the target's profile:
    // - own profile is always visible
    // - blocked users cannot see each other
    // - otherwise allowed if connected, pending, or would appear in recommendations
    private boolean canViewProfile(User viewer, User target) {
        if (viewer.getId().equals(target.getId())) {
            return true;
        }
        Optional<Connection> connectionOpt = connectionService.findBetweenUsers(viewer, target);
        if (connectionOpt.isEmpty()) {
            return matchingService.hasPositiveScore(viewer, target);
        }
        return connectionOpt.get().getStatus() != ConnectionStatus.BLOCKED;
    }

    // GET /api/users/{id} — name + profile picture + links to sub-resources
    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryDto> getUserSummary(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User currentUser = getCurrentUser();
        if (!canViewProfile(currentUser, target)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        String picUrl = target.getProfilePictureUrl() != null ? target.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new UserSummaryDto(
                target.getId(), target.getNickname(), picUrl,
                "/api/users/" + id + "/profile",
                "/api/users/" + id + "/bio"
        ));
    }

    // GET /api/users/{id}/profile — "about me" information
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User currentUser = getCurrentUser();
        if (!canViewProfile(currentUser, target)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return ResponseEntity.ok(new UserProfileDto(target.getId(), target.getAboutMe()));
    }

    // GET /api/users/{id}/bio — biographical data (preferences excluded, those are private)
    @GetMapping("/{id}/bio")
    public ResponseEntity<PublicUserBioDto> getUserBio(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User currentUser = getCurrentUser();
        if (!canViewProfile(currentUser, target)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return ResponseEntity.ok(new PublicUserBioDto(
                target.getId(),
                target.getGender(),
                target.getDateOfBirth(),
                target.getTimezone(),
                target.getTimeRange(),
                target.getGamePreference(),
                target.getGameGenrePreference(),
                target.getLookingFor(),
                target.getPlatforms(),
                target.getIntensity(),
                target.getLocation(),
                target.getOpenToOtherRegions()
        ));
    }
}

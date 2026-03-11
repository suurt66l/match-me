package com.example.web.Controller;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.UserBioDto;
import com.example.web.DTO.UserProfileDto;
import com.example.web.DTO.UserSummaryDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Security.JwtUtil;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // helper to get current user from email
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "User not found"
        ));
    }

    // GET /users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryDto> getUserSummary(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        //placeholder profile picture if null
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new UserSummaryDto(user.getId(), user.getNickname(), picUrl));
    }

    // GET /users/{id}/profile
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(new UserProfileDto(user.getId(), user.getAboutMe()));
    }

    //GET /users/{id}/bio
    @GetMapping("/{id}/bio")
    public ResponseEntity<UserBioDto> getUserBio(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        UserBioDto bio = new UserBioDto(
            user.getId(),
            user.getGender(),
            user.getDateOfBirth(),
            user.getTimezone(),
            user.getTimeRange(),
            user.getGamePreference(),
            user.getGameGenrePreference(),
            user.getLookingFor(),
            user.getPlatforms(),
            user.getIntensity()
        );
        return ResponseEntity.ok(bio);
    }

    //GET /me (shortcut to /users/{id} for authenticated user)
    @GetMapping("/me")
    public ResponseEntity<UserSummaryDto> getMySummary() {
        User user = getCurrentUser();
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new UserSummaryDto(user.getId(), user.getNickname(), picUrl));
    }

    // GET /me/profile
    @GetMapping("/me/profile")
    public ResponseEntity<UserProfileDto> getMyProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(new UserProfileDto(user.getId(), user.getAboutMe()));
    }

    // GET /me/bio
    @GetMapping("/me/bio")
    public ResponseEntity<UserBioDto> getMyBio() {
        User user = getCurrentUser();
        UserBioDto bio = new UserBioDto(            
            user.getId(),
            user.getGender(),
            user.getDateOfBirth(),
            user.getTimezone(),
            user.getTimeRange(),
            user.getGamePreference(),
            user.getGameGenrePreference(),
            user.getLookingFor(),
            user.getPlatforms(),
            user.getIntensity()
        );
        return ResponseEntity.ok(bio);
    }

}

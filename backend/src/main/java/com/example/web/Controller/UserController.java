package com.example.web.Controller;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.UpdateBioRequest;
import com.example.web.DTO.UpdateProfileRequest;
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
    private boolean isAuthenticated() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication != null && 
           authentication.isAuthenticated() && 
           !(authentication.getPrincipal() instanceof String && 
             authentication.getPrincipal().equals("anonymousUser"));
}
    
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
        System.out.println("Entered getUserSummary for id: " + id); //debugging
        //1. check if user exists
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        //2. check if current user has permission
        if (!isAuthenticated()) {
            // if current user is not authenticated, pretend the user doesn't exist (throw 404)
            return ResponseEntity.notFound().build();
        }
        
        //3. otherwise return data
        //placeholder profile picture if null
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new UserSummaryDto(user.getId(), user.getNickname(), picUrl));
    }

    // GET /users/{id}/profile
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!isAuthenticated()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new UserProfileDto(user.getId(), user.getAboutMe()));
    }

    //GET /users/{id}/bio
    @GetMapping("/{id}/bio")
    public ResponseEntity<UserBioDto> getUserBio(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!isAuthenticated()) {
            return ResponseEntity.notFound().build();
        }
        
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
            user.getIntensity(),
            user.getLocation()
        );
        return ResponseEntity.ok(bio);
    }

    @GetMapping("/public-test")
    public String publicTest() {
        return "public";
    }

    @GetMapping("/test404")
    public ResponseEntity<?> test404() {
        return ResponseEntity.notFound().build();
    }


}

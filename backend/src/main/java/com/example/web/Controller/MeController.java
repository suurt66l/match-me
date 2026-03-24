package com.example.web.Controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.MeSummaryDto;
import com.example.web.DTO.UpdateBioRequest;
import com.example.web.DTO.UpdateProfileRequest;
import com.example.web.DTO.UserBioDto;
import com.example.web.DTO.UserProfileDto;
import com.example.web.DTO.UserSummaryDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Security.JwtUtil;
import com.example.web.Service.FileStorageService;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;  // if needed for token extraction; not strictly required here
    private final FileStorageService fileStorageService;

    public MeController(UserRepository userRepository, JwtUtil jwtUtil, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.fileStorageService = fileStorageService;
    }

    // Helper to get current authenticated user from database
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // GET /api/me/account — own account info including email (not exposed on /users/{id})
    @GetMapping("/account")
    public ResponseEntity<MeSummaryDto> getMyAccount() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new MeSummaryDto(user.getId(), user.getNickname(), picUrl, user.getEmail()));
    }

    // GET /api/me
    @GetMapping
    public ResponseEntity<UserSummaryDto> getMySummary() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new UserSummaryDto(user.getId(), user.getNickname(), picUrl));
    }

    // GET /api/me/profile
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getMyProfile() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserProfileDto(user.getId(), user.getAboutMe()));
    }

    // GET /api/me/bio
    @GetMapping("/bio")
    public ResponseEntity<UserBioDto> getMyBio() {
        User user = getCurrentUser();
        if (user == null) {
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

    // PUT /api/me/profile
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (request.getAboutMe() != null) {
            user.setAboutMe(request.getAboutMe());
        }
        userRepository.save(user);
        return ResponseEntity.ok(new UserProfileDto(user.getId(), user.getAboutMe()));
    }

    // PUT /api/me/bio
    @PutMapping("/bio")
    public ResponseEntity<UserBioDto> updateMyBio(@RequestBody UpdateBioRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Partial update
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        if (request.getTimeRange() != null) user.setTimeRange(request.getTimeRange());
        if (request.getGamePreference() != null) user.setGamePreference(request.getGamePreference());
        if (request.getGameGenrePreference() != null) user.setGameGenrePreference(request.getGameGenrePreference());
        if (request.getLookingFor() != null) user.setLookingFor(request.getLookingFor());
        if (request.getPlatforms() != null) user.setPlatforms(request.getPlatforms());
        if (request.getIntensity() != null) user.setIntensity(request.getIntensity());
        if (request.getLocation() != null) user.setLocation(request.getLocation());

        userRepository.save(user);

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

    @PostMapping("/picture")
    public ResponseEntity<UserSummaryDto> uploadProfilePicture(@RequestParam("file") MultipartFile file) throws IOException {
        User user = getCurrentUser();

        //validate file
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        // Store the file
        String filename = fileStorageService.storeFile(file);

        // Build public URL and adjust host/port if needed
        String fileUrl = "/uploads/" + filename;

        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);

        // Return updated summary
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new UserSummaryDto(user.getId(), user.getNickname(), picUrl));
    }
}
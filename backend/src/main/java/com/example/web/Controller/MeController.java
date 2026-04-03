package com.example.web.Controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.example.web.DTO.UpdateAccountRequest;
import com.example.web.DTO.UpdateBioRequest;
import com.example.web.DTO.UpdateProfileRequest;
import com.example.web.DTO.UserBioDto;
import com.example.web.DTO.UserProfileDto;
import com.example.web.DTO.UserSummaryDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Security.JwtUtil;
import com.example.web.Service.FileStorageService;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public MeController(UserRepository userRepository, JwtUtil jwtUtil, FileStorageService fileStorageService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
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
        return ResponseEntity.ok(new MeSummaryDto(user.getId(), user.getNickname(), picUrl, user.getEmail(),
            "/api/users/" + user.getId() + "/profile",
            "/api/users/" + user.getId() + "/bio"
        ));
    }

    // PUT /api/me/account — update nickname, email, password (only fields that are provided)
    @PutMapping("/account")
    public ResponseEntity<MeSummaryDto> updateMyAccount(@RequestBody UpdateAccountRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (request.getNickname() != null && !request.getNickname().isBlank()) {
            user.setNickname(request.getNickname());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        userRepository.save(user);
        String picUrl = user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "";
        return ResponseEntity.ok(new MeSummaryDto(user.getId(), user.getNickname(), picUrl, user.getEmail(),
            "/api/users/" + user.getId() + "/profile",
            "/api/users/" + user.getId() + "/bio"
        ));
    }

    // GET /api/me — redirects to /api/users/{id} (shortcut so clients don't need to know their own ID)
    @GetMapping
    public ResponseEntity<Void> getMySummary() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.status(302)
                .header("Location", "/api/users/" + user.getId())
                .build();
    }

    // GET /api/me/profile — redirects to /api/users/{id}/profile
    @GetMapping("/profile")
    public ResponseEntity<Void> getMyProfile() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.status(302)
                .header("Location", "/api/users/" + user.getId() + "/profile")
                .build();
    }

    // GET /api/me/bio — returns full bio including private preference fields (owner only)
    @GetMapping("/bio")
    public ResponseEntity<UserBioDto> getMyBio() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.notFound().build();
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
                user.getLocation(),
                user.getCountry(),
                user.getMatchScope(),
                user.getPreferredContinents(),
                user.getPreferredCountries(),
                user.getPreferredGenders(),
                user.getPreferredAgeMin(),
                user.getPreferredAgeMax()
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
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getMatchScope() != null) user.setMatchScope(request.getMatchScope());
        if (request.getPreferredContinents() != null) user.setPreferredContinents(request.getPreferredContinents());
        if (request.getPreferredCountries() != null) user.setPreferredCountries(request.getPreferredCountries());
        if (request.getPreferredGenders() != null) user.setPreferredGenders(request.getPreferredGenders());
        if (request.getPreferredAgeMin() != null) user.setPreferredAgeMin(request.getPreferredAgeMin());
        if (request.getPreferredAgeMax() != null) user.setPreferredAgeMax(request.getPreferredAgeMax());

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
                user.getLocation(),
                user.getCountry(),
                user.getMatchScope(),
                user.getPreferredContinents(),
                user.getPreferredCountries(),
                user.getPreferredGenders(),
                user.getPreferredAgeMin(),
                user.getPreferredAgeMax()
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
        return ResponseEntity.ok(new UserSummaryDto(user.getId(), user.getNickname(), picUrl,
            "/api/users/" + user.getId() + "/profile",
            "/api/users/" + user.getId() + "/bio"
        ));
    }

    @DeleteMapping("/picture")
    public ResponseEntity<Void> removeProfilePicture() {
        User user = getCurrentUser();
        user.setProfilePictureUrl(null);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}
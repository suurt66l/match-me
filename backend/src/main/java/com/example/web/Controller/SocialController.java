package com.example.web.Controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web.DTO.IdDto;
import com.example.web.DTO.RecommendationItemDto;
import com.example.web.DTO.RecommendationsResponseDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.MatchingService;

@RestController
@RequestMapping("/api")
public class SocialController {
    private final UserRepository userRepository;
    private final MatchingService matchingService;

    public SocialController(UserRepository userRepository, MatchingService matchingService) {
        this.userRepository = userRepository;
        this.matchingService = matchingService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // Check which required fields are missing from the user's profile
    private List<String> getMissingFields(User user) {
        List<String> missing = new ArrayList<>();

        if (user.getDateOfBirth() == null) missing.add("dateOfBirth");
        if (user.getGamePreference() == null || user.getGamePreference().isBlank()) missing.add("games");
        if (user.getGameGenrePreference() == null || user.getGameGenrePreference().isBlank()) missing.add("gameGenres");
        if (user.getPlatforms() == null || user.getPlatforms().isBlank()) missing.add("platform");
        if (user.getLookingFor() == null || user.getLookingFor().isBlank()) missing.add("lookingFor");
        if (user.getIntensity() == null || user.getIntensity().isBlank()) missing.add("intensity");
        if (user.getTimeRange() == null || user.getTimeRange().isBlank()) missing.add("timeRange");
        if (user.getTimezone() == null || user.getTimezone().isBlank()) missing.add("timezone");
        if (user.getAboutMe() == null || user.getAboutMe().isBlank()) missing.add("aboutMe");

        
        return missing;
    }

    // GET /api/recommendations/complete — check if profile is complete enough to get recommendations.
    // Returns {complete: true} or {complete: false, missingFields: [...]}
    @GetMapping("/recommendations/complete")
    public ResponseEntity<RecommendationsResponseDto> checkProfileComplete() {
        User currentUser = getCurrentUser();
        RecommendationsResponseDto response = new RecommendationsResponseDto();
        List<String> missingFields = getMissingFields(currentUser);
        response.setComplete(missingFields.isEmpty());
        response.setMissingFields(missingFields);
        response.setMatches(new ArrayList<>());
        return ResponseEntity.ok(response);
    }

    // GET /api/recommendations — returns a list of up to 10 user IDs, sorted best match first.
    // Returns 403 if the user's profile is not complete.
    @GetMapping("/recommendations")
    public ResponseEntity<List<Long>> getRecommendations() {
        User currentUser = getCurrentUser();

        if (!getMissingFields(currentUser).isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        // Filter out incomplete profiles and poor matches (score = 0), cap at 10
        List<Long> ids = matchingService.getRecommendations(currentUser.getId())
                .stream()
                .filter(u ->
                        u.getGames() != null && !u.getGames().isBlank() &&
                        u.getGameGenres() != null && !u.getGameGenres().isBlank() &&
                        u.getPlatform() != null && !u.getPlatform().isBlank() &&
                        u.getLookingFor() != null && !u.getLookingFor().isBlank() &&
                        u.getIntensity() != null && !u.getIntensity().isBlank() &&
                        u.getCountry() != null && !u.getCountry().isBlank() &&
                        u.getDateOfBirth() != null &&
                        u.getTimeRange() != null &&
                        u.getAboutMe() != null && !u.getAboutMe().isBlank() &&
                        u.getScore() > 0
                )
                .limit(10)
                .map(RecommendationItemDto::getId)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ids);
    }
}
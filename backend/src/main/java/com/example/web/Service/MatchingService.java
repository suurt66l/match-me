package com.example.web.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.web.DTO.RecommendationItemDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.User;
import com.example.web.Repository.ConnectionRepository;
import com.example.web.Repository.UserRepository;
import com.example.web.utils.TimeUtils;

// MatchingService is the brain of the recommendation system.
// Its job is to take a user and return a sorted list of the best matching other users.
@Service
public class MatchingService {

    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    public MatchingService(UserRepository userRepository, ConnectionRepository connectionRepository) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    // Returns the IDs of all users that the given user already has any connection with
    // (accepted, pending, dismissed — everything). These users are excluded from recommendations.
    private Set<Long> getAlreadyConnectedUserIds(User currentUser) {
        List<Connection> allConnections = connectionRepository.findAllByUser(currentUser);

        return allConnections.stream()
                .map(connection -> {
                    // Each connection has a requester and an addressee.
                    // We want the ID of the OTHER person — not the current user.
                    if (connection.getRequester().getId().equals(currentUser.getId())) {
                        return connection.getAddressee().getId();
                    } else {
                        return connection.getRequester().getId();
                    }
                })
                .collect(Collectors.toSet());
    }

    // Main method — returns up to 10 best-matching users for the given user ID.
    // Results are sorted best match first (highest score first).
    public List<RecommendationItemDto> getRecommendations(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

        // IDs of users we should never recommend (already interacted with)
        Set<Long> alreadyConnectedIds = getAlreadyConnectedUserIds(currentUser);

        // Get every user in the database except ourselves and already-connected users
        List<User> allUsers = userRepository.findAll();
        List<User> candidates = allUsers.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> !alreadyConnectedIds.contains(user.getId()))
                .collect(Collectors.toList());

        // Score each candidate against the current user
        List<ScoredUser> scoredUsers = new ArrayList<>();
        for (User candidate : candidates) {
            // computeScore returns Optional.empty() if the candidate fails a hard filter
            // (wrong location, no time overlap, etc.) — those are excluded entirely
            Optional<Double> score = computeScore(currentUser, candidate);
            if (score.isPresent()) {
                scoredUsers.add(new ScoredUser(candidate, score.get()));
            }
        }

        // Sort by score (highest first) and take the top 10
        List<ScoredUser> top10 = scoredUsers.stream()
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .limit(10)
                .collect(Collectors.toList());

        // Convert to RecommendationItemDto — the object sent back to the frontend
        return top10.stream()
                .map(scoredUser -> new RecommendationItemDto(
                        scoredUser.user.getId(),
                        scoredUser.user.getNickname(),
                        scoredUser.user.getProfilePictureUrl(),
                        scoredUser.user.getCountry(),
                        scoredUser.user.getDateOfBirth(),
                        scoredUser.user.getGamePreference(),
                        scoredUser.user.getGameGenrePreference(),
                        scoredUser.user.getPlatforms(),
                        scoredUser.user.getLookingFor(),
                        scoredUser.user.getIntensity(),
                        scoredUser.user.getTimeRange(),
                        scoredUser.user.getAboutMe(),
                        computeMatchedFields(currentUser, scoredUser.user),
                        scoredUser.score
                ))
                .collect(Collectors.toList());
    }

    // Returns a list of field names where the two users share something in common.
    // Used by the frontend to display "You both play FPS games", etc.
    private List<String> computeMatchedFields(User currentUser, User candidate) {
        List<String> matchedFields = new ArrayList<>();

        if (hasCommonValues(currentUser.getGamePreference(), candidate.getGamePreference()))
            matchedFields.add("games");
        if (hasCommonValues(currentUser.getGameGenrePreference(), candidate.getGameGenrePreference()))
            matchedFields.add("gameGenres");
        if (hasCommonValues(currentUser.getPlatforms(), candidate.getPlatforms()))
            matchedFields.add("platform");
        if (currentUser.getLookingFor() != null && currentUser.getLookingFor().equalsIgnoreCase(candidate.getLookingFor()))
            matchedFields.add("lookingFor");
        if (currentUser.getIntensity() != null && currentUser.getIntensity().equalsIgnoreCase(candidate.getIntensity()))
            matchedFields.add("intensity");
        if (currentUser.getTimeRange() != null && candidate.getTimeRange() != null)
            matchedFields.add("timeRange");

        return matchedFields;
    }

    // Computes the compatibility score between the current user and a candidate.
    //
    // Returns Optional.empty() if any hard filter fails — meaning this candidate
    // should be completely excluded, regardless of other factors.
    //
    // Returns Optional.of(score) where score > 0 if the candidate passes all filters.
    // Higher score = better match.
    //
    // SCORING BREAKDOWN:
    //   - Each minute of overlapping play time      → +1 point
    //   - Each game in common                       → +30 points
    //   - Each genre in common                      → +20 points
    //   - Each platform in common                   → +20 points
    //   - Each shared "looking for" value           → +15 points
    //   - Exact play intensity match                → +50 points
    //   - Same timezone                             → +30 points
    private Optional<Double> computeScore(User currentUser, User candidate) {

        // Hard filter 1: Location — both users must be within each other's max distance
        if (!locationsCompatible(currentUser, candidate)) {
            return Optional.empty();
        }

        // Hard filter 2: Gender preference — candidate must match what the current user prefers
        if (!genderCompatible(currentUser, candidate)) {
            return Optional.empty();
        }

        // Hard filter 3: Age preference — candidate must be within the current user's preferred age range
        if (!ageCompatible(currentUser, candidate)) {
            return Optional.empty();
        }

        // Hard filter 4: Play schedule overlap — they must be online at the same time (at least 1 minute)
        long overlapMinutes = getTimeOverlapMinutes(currentUser, candidate);
        if (overlapMinutes <= 0) {
            return Optional.empty();
        }

        // --- Score calculation ---
        // Start with the number of overlapping play minutes as the base score
        double score = overlapMinutes;

        // Count how many games they have in common — each shared game adds 30 points
        Set<String> currentUserGames = parseCommaSeparated(currentUser.getGamePreference());
        Set<String> candidateGames = parseCommaSeparated(candidate.getGamePreference());
        score += intersectionSize(currentUserGames, candidateGames) * 30.0;

        // Each shared genre adds 20 points
        Set<String> currentUserGenres = parseCommaSeparated(currentUser.getGameGenrePreference());
        Set<String> candidateGenres = parseCommaSeparated(candidate.getGameGenrePreference());
        score += intersectionSize(currentUserGenres, candidateGenres) * 20.0;

        // Each shared platform adds 20 points
        Set<String> currentUserPlatforms = parseCommaSeparated(currentUser.getPlatforms());
        Set<String> candidatePlatforms = parseCommaSeparated(candidate.getPlatforms());
        score += intersectionSize(currentUserPlatforms, candidatePlatforms) * 20.0;

        // Each shared "looking for" value adds 15 points
        Set<String> currentUserLookingFor = parseCommaSeparated(currentUser.getLookingFor());
        Set<String> candidateLookingFor = parseCommaSeparated(candidate.getLookingFor());
        score += intersectionSize(currentUserLookingFor, candidateLookingFor) * 15.0;

        // Exact play intensity match adds 50 points (e.g. both are casual, or both are competitive)
        if (currentUser.getIntensity() != null && candidate.getIntensity() != null
                && currentUser.getIntensity().equalsIgnoreCase(candidate.getIntensity())) {
            score += 50.0;
        }

        // Same timezone adds 30 points (they're likely to be online at similar real-world times)
        if (currentUser.getTimezone() != null && candidate.getTimezone() != null
                && currentUser.getTimezone().equals(candidate.getTimezone())) {
            score += 30.0;
        }

        return Optional.of(score);
    }

    // Used by UserController to decide whether one user is allowed to view another's profile.
    // A user can only see profiles of people they have a compatible match with.
    // Uses the same hard filters as scoring — if any filter fails, they can't see the profile.
    public boolean hasPositiveScore(User userA, User userB) {
        if (!locationsCompatible(userA, userB)) return false;
        if (!genderCompatible(userA, userB) || !genderCompatible(userB, userA)) return false;
        if (!ageCompatible(userA, userB) || !ageCompatible(userB, userA)) return false;
        return getTimeOverlapMinutes(userA, userB) > 0;
    }

    // Checks whether two users are within each other's preferred distance.
    // Uses the Haversine formula to calculate the real-world distance between GPS coordinates.
    // If either user has no GPS coordinates, distance filtering is skipped (no restriction).
    // If either user has no maxDistanceKm set, they have no distance limit.
    private boolean locationsCompatible(User userA, User userB) {
        // Skip distance check if either user hasn't set their location
        if (userA.getLatitude() == null || userA.getLongitude() == null
                || userB.getLatitude() == null || userB.getLongitude() == null) {
            return true;
        }

        double distanceKm = haversineKm(
                userA.getLatitude(), userA.getLongitude(),
                userB.getLatitude(), userB.getLongitude()
        );

        // Both users' distance limits must be satisfied
        if (userA.getMaxDistanceKm() != null && distanceKm > userA.getMaxDistanceKm()) return false;
        if (userB.getMaxDistanceKm() != null && distanceKm > userB.getMaxDistanceKm()) return false;

        return true;
    }

    // Haversine formula — calculates the straight-line distance in kilometres
    // between two points on Earth given their latitude and longitude.
    // This is the standard formula used in GPS applications.
    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Returns true if the candidate's gender matches what the viewer prefers.
    // If the viewer hasn't set a gender preference, any gender is accepted.
    // If the candidate hasn't set their gender, they are always included.
    private boolean genderCompatible(User viewer, User candidate) {
        // No preference set → accept anyone
        if (viewer.getPreferredGenders() == null || viewer.getPreferredGenders().isBlank()) return true;
        // Candidate hasn't specified gender → don't exclude them
        if (candidate.getGender() == null || candidate.getGender().isBlank()) return true;

        // Check if the candidate's gender is in the viewer's list of preferred genders
        return Arrays.stream(viewer.getPreferredGenders().split(","))
                .map(String::trim)
                .anyMatch(preferredGender -> preferredGender.equalsIgnoreCase(candidate.getGender()));
    }

    // Returns true if the candidate's age falls within the viewer's preferred age range.
    // If either bound is not set, that bound is ignored.
    // If the candidate has no date of birth, they are always included.
    private boolean ageCompatible(User viewer, User candidate) {
        if (candidate.getDateOfBirth() == null) return true;

        // Calculate the candidate's current age in full years
        int candidateAge = java.time.Period.between(
                candidate.getDateOfBirth(),
                java.time.LocalDate.now()
        ).getYears();

        if (viewer.getPreferredAgeMin() != null && candidateAge < viewer.getPreferredAgeMin()) return false;
        if (viewer.getPreferredAgeMax() != null && candidateAge > viewer.getPreferredAgeMax()) return false;

        return true;
    }

    // Returns the number of minutes that two users' play schedules overlap in UTC.
    // Returns 0 if either user is missing timezone or time range data.
    private long getTimeOverlapMinutes(User userA, User userB) {
        if (userA.getTimezone() == null || userA.getTimeRange() == null
                || userB.getTimezone() == null || userB.getTimeRange() == null) {
            return 0;
        }
        try {
            int[] userAUtcInterval = TimeUtils.convertTimeRangeToUtcMinutes(userA.getTimeRange(), userA.getTimezone());
            int[] userBUtcInterval = TimeUtils.convertTimeRangeToUtcMinutes(userB.getTimeRange(), userB.getTimezone());
            return TimeUtils.computeOverlapMinutes(userAUtcInterval, userBUtcInterval);
        } catch (Exception e) {
            // If time parsing fails for any reason, treat it as no overlap
            return 0;
        }
    }

    // Returns true if two comma-separated value strings share at least one common value.
    // Example: "FPS,RPG" and "RPG,Strategy" → true (both have "RPG")
    private boolean hasCommonValues(String valuesA, String valuesB) {
        if (valuesA == null || valuesB == null) return false;
        Set<String> setA = parseCommaSeparated(valuesA);
        Set<String> setB = parseCommaSeparated(valuesB);
        // disjoint = true means no values in common, so we negate it
        return !Collections.disjoint(setA, setB);
    }

    // Splits a comma-separated string into a Set of lowercase trimmed values.
    // Example: "Valorant, CS2, Minecraft" → {"valorant", "cs2", "minecraft"}
    // Using a Set means duplicates are automatically removed.
    private Set<String> parseCommaSeparated(String input) {
        if (input == null || input.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toSet());
    }

    // Returns how many values two sets have in common.
    // Example: {"valorant", "cs2"} ∩ {"cs2", "dota2"} → 1
    private int intersectionSize(Set<String> setA, Set<String> setB) {
        Set<String> intersection = new HashSet<>(setA); // copy setA
        intersection.retainAll(setB);                   // keep only values that are also in setB
        return intersection.size();
    }

    // A simple container to hold a User together with their computed score.
    // Used internally during sorting before converting to DTOs.
    private static class ScoredUser {
        User user;
        double score;

        ScoredUser(User user, double score) {
            this.user = user;
            this.score = score;
        }
    }
}

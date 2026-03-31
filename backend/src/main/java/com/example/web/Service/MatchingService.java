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

@Service
public class MatchingService {
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    public MatchingService(UserRepository userRepository, ConnectionRepository connectionRepository) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    // Get all user IDs that current user already has any connection with
    private Set<Long> getConnectedUserIds(User user) {
        List<Connection> connections = connectionRepository.findAllByUser(user);
        return connections.stream()
                .map(conn -> {
                    if (conn.getRequester().getId().equals(user.getId())) {
                        return conn.getAddressee().getId();
                    } else {
                        return conn.getRequester().getId();
                    }
                })
                .collect(Collectors.toSet());
    }

    // Returns up to 10 recommended users as full objects (not just IDs)
    public List<RecommendationItemDto> getRecommendations(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

        Set<Long> connectedIds = getConnectedUserIds(currentUser);
        List<User> allUsers = userRepository.findAll();
        List<User> candidates = allUsers.stream()
            .filter(user -> !user.getId().equals(currentUserId))
            .filter(user -> !connectedIds.contains(user.getId()))
            .collect(Collectors.toList());

        List<ScoredUser> scoredUsers = new ArrayList<>();
        for (User candidate : candidates) {
            Optional<Double> scoreOpt = computeScore(currentUser, candidate);
            if (scoreOpt.isPresent()) {
                scoredUsers.add(new ScoredUser(candidate, scoreOpt.get()));
            }
        }

    // Sort descending by score and take top 10
        List<ScoredUser> topScored = scoredUsers.stream()
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .limit(10)
                .collect(Collectors.toList());

    // Convert to RecommendationItemDto
        return topScored.stream()
            .map(su -> new RecommendationItemDto(
                    su.user.getId(),
                    su.user.getNickname(),
                    su.user.getProfilePictureUrl(),
                    su.user.getLocation(),
                    su.user.getDateOfBirth(),
                    su.user.getGamePreference(),
                    su.user.getGameGenrePreference(),
                    su.user.getPlatforms(),
                    su.user.getLookingFor(),
                    su.user.getIntensity(),
                    su.user.getTimeRange(),
                    su.user.getAboutMe(),
                    computeMatchedFields(currentUser, su.user),
                    su.score
            ))
            .collect(Collectors.toList());
    }

    private List<String> computeMatchedFields(User current, User other) {
        List<String> matched = new ArrayList<>();
        if (hasCommonValues(current.getGamePreference(), other.getGamePreference())) matched.add("games");
        if (hasCommonValues(current.getGameGenrePreference(), other.getGameGenrePreference())) matched.add("gameGenres");
        if (hasCommonValues(current.getPlatforms(), other.getPlatforms())) matched.add("platform");
        if (current.getLookingFor() != null && current.getLookingFor().equalsIgnoreCase(other.getLookingFor())) matched.add("lookingFor");
        if (current.getIntensity() != null && current.getIntensity().equalsIgnoreCase(other.getIntensity())) matched.add("intensity");
        if (current.getTimeRange() != null && other.getTimeRange() != null) matched.add("timeRange");
        return matched;
    }

    private boolean hasCommonValues(String a, String b) {
        if (a == null || b == null) return false;
        Set<String> setA = parseCommaSeparated(a);
        Set<String> setB = parseCommaSeparated(b);
        return !Collections.disjoint(setA, setB);
    }

    private Optional<Double> computeScore(User current, User other) {
        // 1. Location filter (exact match)
        if (current.getLocation() == null || other.getLocation() == null ||
                !current.getLocation().equalsIgnoreCase(other.getLocation())) {
            return Optional.empty();
        }

        // 2. Time availability – primary filter
        if (!hasTimeOverlap(current, other)) {
            return Optional.empty();
        }

        // 3. Compute overlap minutes for scoring
        long overlapMinutes = getTimeOverlapMinutes(current, other);
        if (overlapMinutes <= 0) {
            return Optional.empty();
        }

        // 4. Score calculation: overlap minutes as base, plus other factors
        double score = overlapMinutes;  // each minute is 1 point

        // Game preferences
        Set<String> currentGames = parseCommaSeparated(current.getGamePreference());
        Set<String> otherGames = parseCommaSeparated(other.getGamePreference());
        int commonGames = intersectionSize(currentGames, otherGames);
        score += commonGames * 30.0;  // each common game adds 30 minutes

        // Game genres
        Set<String> currentGenres = parseCommaSeparated(current.getGameGenrePreference());
        Set<String> otherGenres = parseCommaSeparated(other.getGameGenrePreference());
        int commonGenres = intersectionSize(currentGenres, otherGenres);
        score += commonGenres * 20.0;

        // Platforms
        Set<String> currentPlatforms = parseCommaSeparated(current.getPlatforms());
        Set<String> otherPlatforms = parseCommaSeparated(other.getPlatforms());
        int commonPlatforms = intersectionSize(currentPlatforms, otherPlatforms);
        score += commonPlatforms * 20.0;

        // Looking for
        Set<String> currentLooking = parseCommaSeparated(current.getLookingFor());
        Set<String> otherLooking = parseCommaSeparated(other.getLookingFor());
        int commonLooking = intersectionSize(currentLooking, otherLooking);
        score += commonLooking * 15.0;

        // Intensity match (exact)
        if (current.getIntensity() != null && other.getIntensity() != null &&
                current.getIntensity().equalsIgnoreCase(other.getIntensity())) {
            score += 50.0;
        }

        // Timezone similarity – already used in overlap, but we can add bonus if same
        if (current.getTimezone() != null && other.getTimezone() != null &&
                current.getTimezone().equals(other.getTimezone())) {
            score += 30.0;
        }

        return Optional.of(score);
    }

    private boolean hasTimeOverlap(User current, User other) {
        return getTimeOverlapMinutes(current, other) > 0;
    }

    private long getTimeOverlapMinutes(User current, User other) {
        // If either user lacks timezone or timeRange, no overlap
        if (current.getTimezone() == null || current.getTimeRange() == null ||
                other.getTimezone() == null || other.getTimeRange() == null) {
            return 0;
        }
        try {
            int[] currentUtc = TimeUtils.convertTimeRangeToUtcMinutes(current.getTimeRange(), current.getTimezone());
            int[] otherUtc = TimeUtils.convertTimeRangeToUtcMinutes(other.getTimeRange(), other.getTimezone());
            return TimeUtils.computeOverlapMinutes(currentUtc, otherUtc);
        } catch (Exception e) {
            // If parsing fails, treat as no overlap
            return 0;
        }
    }

    // Helper record for scoring
    private static class ScoredUser {
        User user;
        double score;
        ScoredUser(User user, double score) {
            this.user = user;
            this.score = score;
    }
}

    // Splits "Valorant, CS2" into a set: ["valorant", "cs2"]
    private Set<String> parseCommaSeparated(String input) {
        if (input == null || input.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    // How many items are in both sets
    private int intersectionSize(Set<String> set1, Set<String> set2) {
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        return intersection.size();
    }
}

package com.example.web.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.web.DTO.RecommendationItemDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.User;
import com.example.web.Repository.ConnectionRepository;
import com.example.web.Repository.UserRepository;

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

        // Get all users except current user and already connected users
        List<User> candidates = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> !connectedIds.contains(user.getId()))
                .collect(Collectors.toList());

        // Score each candidate
        List<RecommendationItemDto> results = new ArrayList<>();
        for (User candidate : candidates) {
            double score = computeMatchScore(currentUser, candidate);
            List<String> matchedFields = computeMatchedFields(currentUser, candidate);

            RecommendationItemDto item = new RecommendationItemDto();
            item.setId(candidate.getId());
            item.setNickname(candidate.getNickname());
            item.setAvatarUrl(candidate.getProfilePictureUrl());
            item.setCountry(candidate.getLocation());
            item.setDateOfBirth(candidate.getDateOfBirth());
            item.setGames(candidate.getGamePreference());
            item.setGameGenres(candidate.getGameGenrePreference());
            item.setPlatform(candidate.getPlatforms());
            item.setLookingFor(candidate.getLookingFor());
            item.setIntensity(candidate.getIntensity());
            item.setTimeRange(candidate.getTimeRange());
            item.setMatchedFields(matchedFields);
            item.setScore(score);

            results.add(item);
        }

        // Sort by score (highest first) and return top 10
        results.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return results.stream().limit(10).collect(Collectors.toList());
    }

    // Compute a number score for how well two users match
    private double computeMatchScore(User current, User other) {
        double score = 0.0;

        // Games (high weight - 3 points per common game)
        Set<String> currentGames = parseCommaSeparated(current.getGamePreference());
        Set<String> otherGames = parseCommaSeparated(other.getGamePreference());
        score += intersectionSize(currentGames, otherGames) * 3.0;

        // Game genres (2 points per common genre)
        Set<String> currentGenres = parseCommaSeparated(current.getGameGenrePreference());
        Set<String> otherGenres = parseCommaSeparated(other.getGameGenrePreference());
        score += intersectionSize(currentGenres, otherGenres) * 2.0;

        // Platforms (2 points per common platform)
        Set<String> currentPlatforms = parseCommaSeparated(current.getPlatforms());
        Set<String> otherPlatforms = parseCommaSeparated(other.getPlatforms());
        score += intersectionSize(currentPlatforms, otherPlatforms) * 2.0;

        // Intensity (5 points for exact match)
        if (current.getIntensity() != null && other.getIntensity() != null) {
            if (current.getIntensity().equalsIgnoreCase(other.getIntensity())) {
                score += 5.0;
            }
        }

        // Timezone (3 points for same timezone)
        if (current.getTimezone() != null && other.getTimezone() != null) {
            if (current.getTimezone().equals(other.getTimezone())) {
                score += 3.0;
            }
        }

        // Time range (2 points for same time range)
        if (current.getTimeRange() != null && other.getTimeRange() != null) {
            if (current.getTimeRange().equals(other.getTimeRange())) {
                score += 2.0;
            }
        }

        return score;
    }

    // Returns a list of field names that matched between two users
    private List<String> computeMatchedFields(User current, User other) {
        List<String> matched = new ArrayList<>();

        Set<String> currentGames = parseCommaSeparated(current.getGamePreference());
        Set<String> otherGames = parseCommaSeparated(other.getGamePreference());
        if (intersectionSize(currentGames, otherGames) > 0) {
            matched.add("games");
        }

        Set<String> currentGenres = parseCommaSeparated(current.getGameGenrePreference());
        Set<String> otherGenres = parseCommaSeparated(other.getGameGenrePreference());
        if (intersectionSize(currentGenres, otherGenres) > 0) {
            matched.add("gameGenres");
        }

        Set<String> currentPlatforms = parseCommaSeparated(current.getPlatforms());
        Set<String> otherPlatforms = parseCommaSeparated(other.getPlatforms());
        if (intersectionSize(currentPlatforms, otherPlatforms) > 0) {
            matched.add("platform");
        }

        if (current.getLookingFor() != null && other.getLookingFor() != null) {
            if (current.getLookingFor().equalsIgnoreCase(other.getLookingFor())) {
                matched.add("lookingFor");
            }
        }

        if (current.getIntensity() != null && other.getIntensity() != null) {
            if (current.getIntensity().equalsIgnoreCase(other.getIntensity())) {
                matched.add("intensity");
            }
        }

        if (current.getTimezone() != null && other.getTimezone() != null) {
            if (current.getTimezone().equals(other.getTimezone())) {
                matched.add("timezone");
            }
        }

        if (current.getTimeRange() != null && other.getTimeRange() != null) {
            if (current.getTimeRange().equals(other.getTimeRange())) {
                matched.add("timeRange");
            }
        }

        return matched;
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

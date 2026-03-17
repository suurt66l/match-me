package com.example.web.Service;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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

    //returns a list of up to 10 user IDs recommendations

    public List<Long> getRecommendations(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId).orElseThrow(()-> new IllegalArgumentException("Current user not found"));

        Set<Long> connectedIds = getConnectedUserIds(currentUser);

        //fetch all other users
        List<User> allUsers = userRepository.findAll();
        List<User> candidates = allUsers.stream()
                                        .filter(user -> !user.getId().equals(currentUserId))
                                        .filter(user -> !connectedIds.contains(user.getId())) //exclude connected
                                        .collect(Collectors.toList());
        
        // Compute scores and collect into a list of pairs (userId, score)
        List<Map.Entry<Long, Double>> scoredUsers = new ArrayList<>();
        for (User candidate : candidates) {
            double score = computeMatchScore(currentUser, candidate);
            scoredUsers.add(new AbstractMap.SimpleEntry<>(candidate.getId(), score));
        }

        // Sort descdnging by score and pick top 10
        return scoredUsers.stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double computeMatchScore(User current, User other) {
        double score = 0.0;

        // 1. Game preferences (high weight)
        Set<String> currentGames = parseCommaSeparated(current.getGamePreference());
        Set<String> otherGames = parseCommaSeparated(other.getGamePreference());
        int commonGames = intersectionSize(currentGames, otherGames);
        score += commonGames * 3.0;

        // 2. Game genres (medium weight)
        Set<String> currentGenres = parseCommaSeparated(current.getGameGenrePreference());
        Set<String> otherGenres = parseCommaSeparated(other.getGameGenrePreference());
        int commonGenres = intersectionSize(currentGenres, otherGenres);
        score += commonGenres * 2.0;

        //3. Platforms (medium weight)
        Set<String> currentPlatforms = parseCommaSeparated(current.getPlatforms());
        Set<String> otherPlatforms = parseCommaSeparated(other.getPlatforms());
        int commonPlatforms = intersectionSize(currentPlatforms, otherPlatforms);
        score += commonPlatforms * 2.0;

        // 5. Intensity (high weight for exact match, lower for closeness)
        if (current.getIntensity() != null && other.getIntensity() != null) {
            if (current.getIntensity().equalsIgnoreCase(other.getIntensity())) {
                score += 5.0;
            } else {
                // closeness placeholder
            }
        }

        //6. Timezone
        if (current.getTimezone() != null && other.getTimezone() != null) {
            if (current.getTimezone().equals(other.getTimezone())) {
                score += 3.0;
            }
        }

        //7. Time range - simple exact match for now
        if (current.getTimeRange() != null & other.getTimeRange() != null) {
            if (current.getTimeRange().equals(other.getTimeRange())) {
                score += 2.0;
            }
        }

        //8. Location

        return score;
    }

    private Set<String> parseCommaSeparated(String input) {
        if (input == null || input.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s-> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private int intersectionSize(Set<String> set1, Set<String> set2) {
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        return intersection.size();
    }
}

package com.example.web.Controller;

import java.util.Arrays;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.web.Repository.UserRepository;

@RestController
@RequestMapping("/api/lookup")
public class LookupController {
    
    private final UserRepository userRepository;

    public LookupController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/genres")
    public ResponseEntity<Set<String>> getGenres() {
        Set<String> genres = userRepository.findAll().stream()
                .map(user -> user.getGameGenrePreference())
                .filter(Objects::nonNull)
                .flatMap(genreString -> Arrays.stream(genreString.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(genres);
    }

    @GetMapping("/games")
    public ResponseEntity<Set<String>> getGames() {
        Set<String> games = userRepository.findAll().stream()
                .map(user -> user.getGamePreference())
                .filter(Objects::nonNull)
                .flatMap(gameString -> Arrays.stream(gameString.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(games);
    }

    @GetMapping("/platforms")
    public ResponseEntity<Set<String>> getPlatforms() {
        Set<String> platforms = userRepository.findAll().stream()
                .map(user -> user.getPlatforms())
                .filter(Objects::nonNull)
                .flatMap(platformString -> Arrays.stream(platformString.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(platforms);
    }
}

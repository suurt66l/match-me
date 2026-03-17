package com.example.web.Controller;

import java.util.Collections;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.web.DTO.IdDto;
import com.example.web.Repository.UserRepository;

@RestController
@RequestMapping("/api")
public class SocialController {
    private final UserRepository userRepository;
    public SocialController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //GET /recommendations
    @GetMapping("/recommendations")
    public ResponseEntity<List<IdDto>> getRecommendations() {
        //placeholder, currently just returns an empty list
        return ResponseEntity.ok(Collections.emptyList());
    }

    // GET /connections
    @GetMapping("/connections")
    public ResponseEntity<List<IdDto>> getConnections() {
        //placeholder, returns empty list
        return ResponseEntity.ok(Collections.emptyList());
    }
}

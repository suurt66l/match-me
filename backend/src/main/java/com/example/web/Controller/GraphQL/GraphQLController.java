package com.example.web.Controller.GraphQL;

import java.util.Optional;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import com.example.web.DTO.GraphQL.UserBioDto;
import com.example.web.DTO.GraphQL.UserPreferencesDto;
import com.example.web.DTO.GraphQL.UserProfileDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.ConnectionStatus;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.MatchingService;

@Controller
public class GraphQLController {
    private final UserRepository userRepository;
    private final ConnectionService connectionService;
    private final MatchingService matchingService;

    public GraphQLController(UserRepository userRepository, ConnectionService connectionService,
            MatchingService matchingService) {
        this.userRepository = userRepository;
        this.connectionService = connectionService;
        this.matchingService = matchingService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    private boolean canViewProfile(User viewer, User target) {
        if (viewer.getId().equals(target.getId())) {
            return true;
        }
        Optional<Connection> connectionOpt = connectionService.findBetweenUsers(viewer, target);
        if (connectionOpt.isEmpty()) {
            return matchingService.hasPositiveScore(viewer, target);
        }
        return connectionOpt.get().getStatus() != ConnectionStatus.BLOCKED;
    }

    private UserBioDto getBio(User user) {
        return 
            new UserBioDto(
                user.getDateOfBirth(), 
                user.getGender(), 
                user.getCountry(), 
                user.getCity(),
                user.getTimeRange(),
                user.getTimezone(),
                user.getGamePreference(),
                user.getGameGenrePreference(),
                user.getLookingFor(),
                user.getPlatforms(),
                user.getIntensity(),
                user.getPreferredGenders(),
                user.getPreferredAgeMin(),
                user.getPreferredAgeMax(),
                user.getMaxDistanceKm());
    }
    
    // user(id)
    @QueryMapping
    public User user(@Argument Long id){
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("You don't have permission to view this profile"));
        User currentUser = getCurrentUser();

        if (currentUser == null || !canViewProfile(currentUser, target)) {
            throw new RuntimeException("You don't have permission to view this profile");
        }

        return target;
    }

    // bio(id)
    @QueryMapping
    public UserBioDto bio(@Argument Long id){
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("You don't have permission to view this profile"));
        User currentUser = getCurrentUser();

        if (currentUser == null || !canViewProfile(currentUser, target)) {
            throw new RuntimeException("You don't have permission to view this profile");
        }

        return getBio(target);
    }

    // profile(id)
    @QueryMapping
    public UserProfileDto profile(@Argument Long id){
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("You don't have permission to view this profile"));
        User currentUser = getCurrentUser();

        if (currentUser == null || !canViewProfile(currentUser, target)) {
            throw new RuntimeException("You don't have permission to view this profile");
        }

        return new UserProfileDto(target.getAboutMe());
    }

    // me
    @QueryMapping
    public User me(){
        return getCurrentUser();
    }

    // me(bio)
    @SchemaMapping(typeName = "User", field = "bio")
    public UserBioDto resolveUserBio(User user) {
        return getBio(user);
    }

    // me(bio(preferences))
    @SchemaMapping(typeName = "Bio", field = "preferences")
    public UserPreferencesDto resolveUserPreferences(UserBioDto userBioDto) {
        return 
            new UserPreferencesDto(
                userBioDto.getTimeRange(),
                userBioDto.getTimeZone(),
                userBioDto.getGamePreference(),
                userBioDto.getGameGenrePreference(),
                userBioDto.getLookingFor(),
                userBioDto.getPlatforms(),
                userBioDto.getIntensity(),
                userBioDto.getPreferredGenders(),
                userBioDto.getPreferredAgeMin(),
                userBioDto.getPreferredAgeMax(),
                userBioDto.getMaxDistanceKm()
            );
    }

    // me(profile)
    @SchemaMapping(typeName = "User", field = "profile")
    public UserProfileDto getProfile(User user){
        return new UserProfileDto(user.getAboutMe());
    }

}

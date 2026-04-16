package com.example.web.Controller.GraphQL;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import com.example.web.DTO.RecommendationItemDto;
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
                user.getMaxDistanceKm(),
                user.getId());
    }
    
    private List<String> getMissingFields(User user) {
        List<String> missing = new ArrayList<>();

        if (user.getDateOfBirth() == null) missing.add("dateOfBirth");
        if (user.getGender() == null || user.getGender().isBlank()) missing.add("gender");
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

        return new UserProfileDto(target.getAboutMe(), target.getId());
    }

    // me
    @QueryMapping
    public User me(){
        return getCurrentUser();
    }


    // myBio
    @QueryMapping
    public UserBioDto myBio(){
        User user = getCurrentUser();
        if (user == null) throw new RuntimeException("Not authenticated");
        return getBio(user);
    }

    // myProfile
    @QueryMapping
    public UserProfileDto myProfile(){
        User user = getCurrentUser();
        if (user == null) throw new RuntimeException("Not authenticated");
        return new UserProfileDto(user.getAboutMe(), user.getId());
    }

    // Recomendations
    @QueryMapping
    public List<User> recommendations() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");
        
        // Check if user profile completed
        if (!getMissingFields(currentUser).isEmpty()) {
            throw new RuntimeException("Profile isn't completed!");
        }

        // Filter out incomplete profiles and poor matches (score = 0), cap at 10
        List<User> recomendations = matchingService.getRecommendations(currentUser.getId())
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
                .map(rec -> userRepository.findById(rec.getId())
                                            .orElse(null))
                                            .filter(u -> u != null)
                .collect(java.util.stream.Collectors.toList());

        return recomendations;
    }

    // Connections(accepted)
    @QueryMapping
    public List<User> connections() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");
        
        // If requester is the curren user than write recipient User data
        List<User> connections = connectionService.getAcceptedConnections(currentUser)
                                                    .stream()
                                                    .map(c -> c.getRequester().getId().equals(currentUser.getId())
                                                            ? c.getAddressee()
                                                            : c.getRequester())
                                                    .collect(java.util.stream.Collectors.toList());
        
        return connections;
    }

    // me -> (bio)
    @SchemaMapping(typeName = "User", field = "bio")
    public UserBioDto resolveUserBio(User user) {
        return getBio(user);
    }

    // me -> (bio -> preferences)
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

    // me -> (profile)
    @SchemaMapping(typeName = "User", field = "profile")
    public UserProfileDto getProfile(User user){
        return new UserProfileDto(user.getAboutMe(), user.getId());
    }

    @SchemaMapping(typeName = "Bio", field = "user")
    public User getBioUser(UserBioDto userBioDto){
        return userRepository.findById(userBioDto.getUserId()).orElse(null);
    }

    @SchemaMapping(typeName = "Profile", field = "user")
    public User getProfileUser(UserProfileDto userProfileDto){
        return userRepository.findById(userProfileDto.getUserId()).orElse(null);
    }

}

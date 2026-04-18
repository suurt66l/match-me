package com.example.web.Controller.GraphQL;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;

import com.example.web.DTO.GraphQL.OnlineStatusDto;
import com.example.web.DTO.GraphQL.UpdateAccountDto;
import com.example.web.DTO.GraphQL.UpdateBioDto;
import com.example.web.DTO.GraphQL.UserBioDto;
import com.example.web.DTO.GraphQL.UserPreferencesDto;
import com.example.web.DTO.GraphQL.UserProfileDto;
import com.example.web.Entity.Connection;
import com.example.web.Entity.ConnectionStatus;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import com.example.web.Service.ConnectionService;
import com.example.web.Service.MatchingService;
import com.example.web.Service.OnlineStatusRegistry;

import reactor.core.publisher.Flux;

@Controller
public class GraphQLController {
    private final UserRepository userRepository;
    private final ConnectionService connectionService;
    private final MatchingService matchingService;
    private final PasswordEncoder passwordEncoder;
    private final OnlineStatusRegistry onlineStatusRegistry;

    public GraphQLController(UserRepository userRepository, ConnectionService connectionService,
            MatchingService matchingService, PasswordEncoder passwordEncoder,
            OnlineStatusRegistry onlineStatusRegistry) {
        this.userRepository = userRepository;
        this.connectionService = connectionService;
        this.matchingService = matchingService;
        this.passwordEncoder = passwordEncoder;
        this.onlineStatusRegistry = onlineStatusRegistry;
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

    // Connections(aceepted)
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

    // Connections(incoming)
    @QueryMapping
    public List<User> incomingConnections() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");
        
        // If requester is the curren user than write recipient User data
        List<User> connections = connectionService.getPendingIncomingConnections(currentUser) 
                                                    .stream()
                                                    .map(c -> c.getRequester().getId().equals(currentUser.getId())
                                                            ? c.getAddressee()
                                                            : c.getRequester())
                                                    .collect(java.util.stream.Collectors.toList());
        
        return connections;
    }

    // Connections(outgoing)
    @QueryMapping
    public List<User> outgoingConnections() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");
        
        // If requester is the curren user than write recipient User data
        List<User> connections = connectionService.getPendingOutgoingConnections(currentUser) 
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

    /* Profile Mutations */
    @MutationMapping
    public User updateAccount(@Argument UpdateAccountDto input) {
        User user = getCurrentUser();
        if (user == null) throw new RuntimeException("Not authenticated");

        if (input.getNickname() != null && !input.getNickname().isBlank()) user.setNickname(input.getNickname());
        if (input.getEmail() != null && !input.getEmail().isBlank()) {
            if (input.getCurrentPassword() == null ||
                    !passwordEncoder.matches(input.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            } else {
                user.setEmail(input.getEmail());
            }
        }
        if (input.getNewPassword() != null && !input.getNewPassword().isBlank()) {
            if (input.getCurrentPassword() == null ||
                    !passwordEncoder.matches(input.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            } else {
                user.setPassword(passwordEncoder.encode(input.getNewPassword()));
            }
        }

        userRepository.save(user);

        return user;
    }

    @MutationMapping
    public UserBioDto updateBio(@Argument UpdateBioDto input) {
        User user = getCurrentUser();
        if (user == null) throw new RuntimeException("Not authenticated");

        if (input.getGender() != null) user.setGender(input.getGender());
        if (input.getDateOfBirth() != null) user.setDateOfBirth(java.time.LocalDate.parse(input.getDateOfBirth()));
        if (input.getTimeZone() != null) user.setTimezone(input.getTimeZone());
        if (input.getTimeRange() != null) user.setTimeRange(input.getTimeRange());
        if (input.getCountry() != null) user.setCountry(input.getCountry());
        if (input.getCity() != null) user.setCity(input.getCity());
        if (input.getLatitude() != null) user.setLatitude(input.getLatitude());
        if (input.getLongitude() != null) user.setLongitude(input.getLongitude());
        if (input.getGamePreference() != null) user.setGamePreference(input.getGamePreference());
        if (input.getGameGenrePreference() != null) user.setGameGenrePreference(input.getGameGenrePreference());
        if (input.getLookingFor() != null) user.setLookingFor(input.getLookingFor());
        if (input.getPlatforms() != null) user.setPlatforms(input.getPlatforms());
        if (input.getIntensity() != null) user.setIntensity(input.getIntensity());
        if (input.getMaxDistanceKm() != null) user.setMaxDistanceKm(input.getMaxDistanceKm());
        if (input.getPreferredGenders() != null) user.setPreferredGenders(input.getPreferredGenders());
        if (input.getPreferredAgeMin() != null) user.setPreferredAgeMin(input.getPreferredAgeMin());
        if (input.getPreferredAgeMax() != null) user.setPreferredAgeMax(input.getPreferredAgeMax());

        userRepository.save(user);
        UserBioDto bio = getBio(user);
        return bio;

    }

    @MutationMapping
    public UserProfileDto updateProfile(@Argument String aboutMe) {
        User user = getCurrentUser();

        if (user == null) throw new RuntimeException("Not authenticated");
        
        user.setAboutMe(aboutMe);
        userRepository.save(user);
        
        return new UserProfileDto(user.getAboutMe(), user.getId());
    }

    /* Connection Mutations */
    @MutationMapping
    public Boolean sendConnectionRequest(@Argument Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");

        try{
            connectionService.sendRequest(currentUser, userId);
        } catch (org.springframework.web.server.ResponseStatusException e){
            throw new RuntimeException(e.getReason());
        }

        return true;
    }

    @MutationMapping
    public Boolean acceptConnection(@Argument Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");

        User target = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Connection connection = connectionService.findBetweenUsers(currentUser, target)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        try{
            connectionService.acceptRequest(currentUser, connection.getId());
        } catch (org.springframework.web.server.ResponseStatusException e){
            throw new RuntimeException(e.getReason());
        }

        return true;
    }

    @MutationMapping
    public Boolean rejectConnection(@Argument Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");

        User target = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Connection connection = connectionService.findBetweenUsers(currentUser, target)
                .orElseThrow(() -> new RuntimeException("Connection not found"));
        try{
            connectionService.rejectOrCancel(currentUser, connection.getId());
        } catch (org.springframework.web.server.ResponseStatusException e){
            throw new RuntimeException(e.getReason());
        }

        return true;
    }

    @MutationMapping
    public Boolean blockUser(@Argument Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");

        try {
            connectionService.blockUser(currentUser, userId);
        } catch (org.springframework.web.server.ResponseStatusException e){
            throw new RuntimeException(e.getReason());
        }

        return true;
    }

    @MutationMapping
    public Boolean removeConnection(@Argument Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");

        try {
            connectionService.dismissByUserId(currentUser, userId);
        } catch (org.springframework.web.server.ResponseStatusException e){
            throw new RuntimeException(e.getReason());
        }
        return true;
    }

    /* Online/Offline user status */
    @MutationMapping
    public Boolean setOffline() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");
        onlineStatusRegistry.setOffline(currentUser.getId());
        return true;
    }
    

    @MutationMapping
    public Boolean setOnline() {
        User currentUser = getCurrentUser();
        if (currentUser == null) throw new RuntimeException("Not authenticated");
        onlineStatusRegistry.setOnline(currentUser.getId());
        return true;
    }

    @SubscriptionMapping
    public Flux<OnlineStatusDto> onlineStatus() { 
        return onlineStatusRegistry.getOnlineStatusStream();
    }
}

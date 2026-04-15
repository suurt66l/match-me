package com.example.web.Controller;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import com.example.web.DTO.GraphQL.UserBioDto;
import com.example.web.DTO.GraphQL.UserPreferencesDto;
import com.example.web.DTO.GraphQL.UserProfileDto;
import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;

@Controller
public class GraphQLController {
    private final UserRepository userRepository;

    public GraphQLController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    
    @QueryMapping
    public User me(){
        return getCurrentUser();
    }

    @SchemaMapping(typeName = "User", field = "bio")
    public UserBioDto getBio(User user) {
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

    @SchemaMapping(typeName = "Bio", field = "preferences")
    public UserPreferencesDto getPreferences(UserBioDto userBioDto) {
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

    @SchemaMapping(typeName = "User", field = "profile")
    public UserProfileDto getProfile(User user){
        return new UserProfileDto(user.getAboutMe());
    }
}

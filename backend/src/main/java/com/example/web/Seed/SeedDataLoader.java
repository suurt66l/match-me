package com.example.web.Seed;

import com.example.web.Entity.User;
import com.example.web.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Manual seed endpoint for development use.
 * POST  /api/seed  — creates 120 fictitious users (test10@test.com ... test129@test.com, password: 1234)
 * DELETE /api/seed — deletes all seeded users (emails matching test*@test.com pattern)
 */
@RestController
@RequestMapping("/api/seed")
public class SeedDataLoader {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedDataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<String> seed() {
        if (userRepository.count() >= 100) {
            return ResponseEntity.ok("Skipped: database already has 100+ users.");
        }

        String password = passwordEncoder.encode("1234");

        // --- Data pools ---

        // Continents paired with UTC offsets — same format as the frontend timezone selector
        String[][] locationTimezone = {
            {"Europe",        "UTC+1"},
            {"North America", "UTC-5"},
            {"Asia",          "UTC+9"},
        };

        String[] timeRanges = {"08:00-14:00", "12:00-18:00", "16:00-22:00", "20:00-02:00"};

        // Groups of games that share genres — creates natural clusters for the matcher
        String[][] gameGroups = {
            {"Valorant", "CS2"},
            {"League of Legends", "Dota 2"},
            {"Fortnite", "Apex Legends"},
            {"Minecraft", "Terraria"},
            {"Overwatch 2", "Paladins"},
            {"Rocket League", "FIFA 25"},
            {"Elden Ring", "Dark Souls 3"},
            {"World of Warcraft", "Final Fantasy XIV"},
        };

        String[][] genreGroups = {
            {"FPS", "Battle Royale"},
            {"MOBA", "Strategy"},
            {"Battle Royale", "FPS"},
            {"Sandbox", "Survival"},
            {"FPS", "Hero Shooter"},
            {"Sports", "Racing"},
            {"RPG", "Action"},
            {"RPG", "MMO"},
        };

        String[] platformGroups = {
            "PC",
            "PC, PlayStation",
            "PlayStation",
            "PC, Xbox",
            "Xbox",
            "PC, Nintendo Switch",
            "Nintendo Switch",
            "PC",
        };

        String[] lookingFor = {
            "Play together",
            "Friendship",
            "Just to chat",
            "Relationships IRL",
        };

        String[] intensities = {"3", "4", "5", "5", "6", "6", "7", "8"};

        String[] genders = {"Male", "Female", "Non-binary"};

        String[] nicknames = {
            "ShadowFox", "NeonBlade", "CryptoKnight", "FrostWolf", "IronHawk",
            "LaserPanda", "GhostRider", "SteelViper", "ArcticOwl", "StormCrow",
            "PixelKing", "ByteHunter", "VoidWalker", "StarFalcon", "LunarTiger",
            "CyberDrake", "RiftBreaker", "DawnArcher", "NovaStriker", "BlazePeak",
            "SilentDagger", "WildCobra", "GlitchBear", "ThunderLynx", "EmberWolf",
            "CodeMonkey", "NightStalker", "OmegaSniper", "PrismSlayer", "EchoRaven",
            "TurboRex", "ZeroGhost", "FluxRider", "ApexWarden", "CoreBreaker",
            "TitanSpark", "MechWarden", "QuantumFox", "RogueStar", "DarkPulse",
        };

        String[] aboutMeTexts = {
            "Veteran gamer with 10+ years of experience. Looking for serious teammates.",
            "Casual player who loves to chill and explore new games. Very chill, no toxicity.",
            "Competitive grinder aiming for the top ranks. Need disciplined squad members.",
            "I play almost every evening after work. Let's build a regular squad.",
            "Story-driven games are my passion but I love co-op multiplayer too.",
            "Night owl — most active after 8pm. Love late-night sessions.",
            "Morning gamer here. Early bird gets the loot!",
            "I main support roles and love enabling my teammates to shine.",
            "Fragger and entry main. Looking for a team that values aggression.",
            "New to competitive gaming but learning fast. Patient teammates welcome.",
        };

        for (int i = 0; i < 120; i++) {
            int emailNum = i + 10;
            String email = "test" + emailNum + "@test.com";

            // Skip if this email already exists
            if (userRepository.findByEmail(email).isPresent()) continue;

            int groupIdx = i % gameGroups.length;
            int locIdx   = i % locationTimezone.length;
            int timeIdx  = i % timeRanges.length;

            // Use 1 or 2 games from the same group — creates matching clusters
            String userGames  = (i % 3 == 0)
                ? gameGroups[groupIdx][0]
                : gameGroups[groupIdx][0] + ", " + gameGroups[groupIdx][1];

            String userGenres = genreGroups[groupIdx][0] + ", " + genreGroups[groupIdx][1];
            String userPlats  = platformGroups[groupIdx];

            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setNickname(nicknames[i % nicknames.length] + emailNum);
            user.setDateOfBirth(LocalDate.of(1993 + (i % 12), 1 + (i % 12), 1 + (i % 27)));
            user.setGender(genders[i % genders.length]);
            user.setLocation(locationTimezone[locIdx][0]);
            user.setTimezone(locationTimezone[locIdx][1]);
            user.setTimeRange(timeRanges[timeIdx]);
            user.setGamePreference(userGames);
            user.setGameGenrePreference(userGenres);
            user.setPlatforms(userPlats);
            user.setLookingFor(lookingFor[i % lookingFor.length]);
            user.setIntensity(intensities[i % intensities.length]);
            user.setAboutMe(aboutMeTexts[i % aboutMeTexts.length]);

            userRepository.save(user);
        }

        return ResponseEntity.ok("Seed complete: 120 users created (test10@test.com ... test129@test.com, password: 1234)");
    }

    // DELETE /api/seed — removes all seeded users (test10@test.com and above)
    // Users below test10 (e.g. test1@test.com) are NOT deleted
    @DeleteMapping
    public ResponseEntity<String> deleteSeed() {
        // Match test10@test.com through test999@test.com — two or more digits after "test"
        List<User> seeded = userRepository.findByEmailLike("test%@test.com").stream()
                .filter(u -> {
                    String local = u.getEmail().replace("@test.com", "").replace("test", "");
                    try {
                        return Integer.parseInt(local) >= 10;
                    } catch (NumberFormatException e) {
                        return false;
                    }
                })
                .toList();
        userRepository.deleteAll(seeded);
        return ResponseEntity.ok("Deleted " + seeded.size() + " seeded users.");
    }
}

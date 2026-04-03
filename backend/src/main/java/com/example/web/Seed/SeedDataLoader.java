package com.example.web.Seed;

import com.example.web.Entity.User;
import com.example.web.Repository.ConnectionRepository;
import com.example.web.Repository.MessageRepository;
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
    private final ConnectionRepository connectionRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedDataLoader(UserRepository userRepository, ConnectionRepository connectionRepository,
                          MessageRepository messageRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<String> seed() {
        if (userRepository.count() >= 100) {
            return ResponseEntity.ok("Skipped: database already has 100+ users.");
        }

        String password = passwordEncoder.encode("1234");

        // Each entry: { continent, country, timezone }
        // ~75% Europe (30% Estonia emphasis), ~15% North America, ~10% Asia
        String[][] locationData = {
            {"Europe", "Estonia",        "UTC+2"},
            {"Europe", "Estonia",        "UTC+2"},
            {"Europe", "Estonia",        "UTC+2"},
            {"Europe", "Estonia",        "UTC+2"},
            {"Europe", "Estonia",        "UTC+2"},
            {"Europe", "Estonia",        "UTC+2"},
            {"Europe", "Latvia",         "UTC+2"},
            {"Europe", "Lithuania",      "UTC+2"},
            {"Europe", "Finland",        "UTC+2"},
            {"Europe", "Germany",        "UTC+1"},
            {"Europe", "Poland",         "UTC+1"},
            {"Europe", "Sweden",         "UTC+1"},
            {"Europe", "Norway",         "UTC+1"},
            {"Europe", "Netherlands",    "UTC+1"},
            {"Europe", "France",         "UTC+1"},
            {"North America", "United States", "UTC-5"},
            {"North America", "Canada",        "UTC-5"},
            {"North America", "United States", "UTC-8"},
            {"Asia", "Japan",     "UTC+9"},
            {"Asia", "South Korea", "UTC+9"},
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

            if (userRepository.findByEmail(email).isPresent()) continue;

            int groupIdx = i % gameGroups.length;
            int locIdx   = i % locationData.length;
            int timeIdx  = i % timeRanges.length;

            String userGames  = (i % 3 == 0)
                ? gameGroups[groupIdx][0]
                : gameGroups[groupIdx][0] + ", " + gameGroups[groupIdx][1];

            String userGenres = genreGroups[groupIdx][0] + ", " + genreGroups[groupIdx][1];
            String userPlats  = platformGroups[groupIdx];

            // Gender distribution: 50% Female, 30% Non-binary, 20% Male
            String gender = switch (i % 10) {
                case 0, 1, 2, 3, 4 -> "Female";
                case 5, 6, 7       -> "Non-binary";
                default            -> "Male";
            };

            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setNickname(nicknames[i % nicknames.length] + emailNum);
            user.setDateOfBirth(LocalDate.of(1993 + (i % 12), 1 + (i % 12), 1 + (i % 27)));
            user.setGender(gender);
            user.setLocation(locationData[locIdx][0]);
            user.setCountry(locationData[locIdx][1]);
            user.setTimezone(locationData[locIdx][2]);
            user.setTimeRange(timeRanges[timeIdx]);
            user.setGamePreference(userGames);
            user.setGameGenrePreference(userGenres);
            user.setPlatforms(userPlats);
            user.setLookingFor(lookingFor[i % lookingFor.length]);
            user.setIntensity(intensities[i % intensities.length]);
            user.setAboutMe(aboutMeTexts[i % aboutMeTexts.length]);
            user.setMatchScope("global");

            userRepository.save(user);
        }

        return ResponseEntity.ok("Seed complete: 120 users created (test10@test.com ... test129@test.com, password: 1234)");
    }

    // DELETE /api/seed — removes all seeded users (test10@test.com and above)
    // Users below test10 (e.g. test1@test.com) are NOT deleted
    @DeleteMapping
    public ResponseEntity<String> deleteSeed() {
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
        // Delete in order: messages → connections → users (FK constraints)
        seeded.forEach(u -> messageRepository.deleteAllByUser(u));
        seeded.forEach(u -> connectionRepository.deleteAll(connectionRepository.findAllByUser(u)));
        userRepository.deleteAll(seeded);
        return ResponseEntity.ok("Deleted " + seeded.size() + " seeded users.");
    }
}

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

        // Each entry: { continent, country, city, timezone }
        // ~75% Europe (6 Estonia cities), ~15% North America, ~10% Asia
        String[][] locationData = {
            {"Europe", "Estonia",          "Tallinn",     "UTC+2"},
            {"Europe", "Estonia",          "Tartu",       "UTC+2"},
            {"Europe", "Estonia",          "Narva",       "UTC+2"},
            {"Europe", "Estonia",          "Pärnu",       "UTC+2"},
            {"Europe", "Estonia",          "Tallinn",     "UTC+2"},
            {"Europe", "Estonia",          "Tartu",       "UTC+2"},
            {"Europe", "Latvia",           "Riga",        "UTC+2"},
            {"Europe", "Lithuania",        "Vilnius",     "UTC+2"},
            {"Europe", "Finland",          "Helsinki",    "UTC+2"},
            {"Europe", "Germany",          "Berlin",      "UTC+1"},
            {"Europe", "Poland",           "Warsaw",      "UTC+1"},
            {"Europe", "Sweden",           "Stockholm",   "UTC+1"},
            {"Europe", "Norway",           "Oslo",        "UTC+1"},
            {"Europe", "Netherlands",      "Amsterdam",   "UTC+1"},
            {"Europe", "France",           "Paris",       "UTC+1"},
            {"North America", "United States", "New York",    "UTC-5"},
            {"North America", "Canada",        "Toronto",     "UTC-5"},
            {"North America", "United States", "Los Angeles", "UTC-8"},
            {"Asia", "Japan",              "Tokyo",       "UTC+9"},
            {"Asia", "South Korea",        "Seoul",       "UTC+9"},
        };

        // GPS coordinates matching the locationData order (base coordinates per city)
        double[] baseLat = {
             59.4370,  58.3780,  59.3977,  58.3893,  59.4370,  58.3780, // Estonia
             56.9496,  54.6872,  60.1699,  52.5200,  52.2297,  59.3293, // Latvia..France
             59.9139,  52.3676,  48.8566,                                // Oslo..Paris
             40.7128,  43.6532,  34.0522,                                // NA
             35.6762,  37.5665                                           // Asia
        };
        double[] baseLng = {
             24.7536,  26.7290,  28.1469,  24.4997,  24.7536,  26.7290, // Estonia
             24.1052,  25.2797,  24.9384,  13.4050,  21.0122,  18.0686, // Latvia..Stockholm
             10.7522,   4.9041,   2.3522,                                // Oslo..Paris
            -74.0060, -79.3832,-118.2437,                                // NA
            139.6503, 126.9780                                           // Asia
        };

        String[] timeRanges = {"08:00-14:00", "12:00-18:00", "16:00-22:00", "20:00-02:00"};

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
            "PC", "PC, PlayStation", "PlayStation", "PC, Xbox",
            "Xbox", "PC, Nintendo Switch", "Nintendo Switch", "PC",
        };

        String[] lookingFor = {"Play together", "Friendship", "Just to chat", "Relationships IRL"};
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

        // maxDistanceKm variation: null=any, 500=regional, 2000=wide
        Integer[] maxDistances = {null, 500, 2000};

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

            // Gender: 50% Female, 30% Non-binary, 20% Male
            String gender = switch (i % 10) {
                case 0, 1, 2, 3, 4 -> "Female";
                case 5, 6, 7       -> "Non-binary";
                default            -> "Male";
            };

            // Scatter users slightly around their city's base coordinates
            double lat = baseLat[locIdx] + (i % 7 - 3) * 0.015;
            double lng = baseLng[locIdx] + (i % 5 - 2) * 0.015;

            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setNickname(nicknames[i % nicknames.length] + emailNum);
            user.setDateOfBirth(LocalDate.of(1993 + (i % 12), 1 + (i % 12), 1 + (i % 27)));
            user.setGender(gender);
            user.setLocation(locationData[locIdx][0]);
            user.setCountry(locationData[locIdx][1]);
            user.setCity(locationData[locIdx][2]);
            user.setTimezone(locationData[locIdx][3]);
            user.setLatitude(lat);
            user.setLongitude(lng);
            user.setMaxDistanceKm(maxDistances[i % maxDistances.length]);
            user.setTimeRange(timeRanges[timeIdx]);
            user.setGamePreference(userGames);
            user.setGameGenrePreference(genreGroups[groupIdx][0] + ", " + genreGroups[groupIdx][1]);
            user.setPlatforms(platformGroups[groupIdx]);
            user.setLookingFor(lookingFor[i % lookingFor.length]);
            user.setIntensity(intensities[i % intensities.length]);
            user.setAboutMe(aboutMeTexts[i % aboutMeTexts.length]);

            userRepository.save(user);
        }

        return ResponseEntity.ok("Seed complete: 120 users created (test10@test.com ... test129@test.com, password: 1234)");
    }

    @DeleteMapping
    public ResponseEntity<String> deleteSeed() {
        List<User> seeded = userRepository.findByEmailLike("test%@test.com").stream()
                .filter(u -> {
                    String local = u.getEmail().replace("@test.com", "").replace("test", "");
                    try { return Integer.parseInt(local) >= 10; }
                    catch (NumberFormatException e) { return false; }
                })
                .toList();
        seeded.forEach(u -> messageRepository.deleteAllByUser(u));
        seeded.forEach(u -> connectionRepository.deleteAll(connectionRepository.findAllByUser(u)));
        userRepository.deleteAll(seeded);
        return ResponseEntity.ok("Deleted " + seeded.size() + " seeded users.");
    }
}

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// HTTP server wrapping Express so WebSocket can share the same port
const server = createServer(app);
const wss = new WebSocketServer({ server });

// email → WebSocket connection (one active connection per user)
const onlineUsers = new Map();

// Candidates that act as "online" bots
const onlineCandidateIds = new Set([1, 4, 8]);

const botReplies = [
  "hey! what's up?",
  "sounds good to me",
  "yeah I'm usually on in the evenings",
  "let's play sometime!",
  "nice, I've been grinding ranked lately",
  "haha true",
  "what rank are you?",
  "gg!",
];

// conversationKey(a, b) always returns the same string regardless of order
function conversationKey(emailA, emailB) {
  return [emailA, emailB].sort().join("::");
}

// In-memory messages: { [conversationKey]: [{ from, text, timestamp }] }
const messages = {};

// Per-user storage keyed by email. Real users get numeric IDs starting at 101.
let nextUserId = 103;

const users = {
  "test@test.com": {
    id: 101,
    password: "1234",
    connections: [102, 1, 8], // test2 + two candidates
    profile: {
      nickname: "TestUser",
      email: "test@test.com",
      dateOfBirth: "1998-06-15",
      gender: "male",
      country: "Estonia",
      aboutMe: "Hardcore gamer looking for teammates",
      avatarUrl: "/assets/avatars/1773729488962-ChatGPT_Image_Nov_14_2025_04_09_38_PM.png",
    },
    bio: {
      gameTimeFrom: "20:00",
      gameTimeTo: "00:00",
      games: "Valorant, CS2",
      gameGenres: "FPS",
      platform: "pc",
      lookingFor: "for-play",
      intensity: "8",
    },
  },
  "test2@test.com": {
    id: 102,
    password: "1234",
    connections: [101], // test is already a connection
    profile: {
      nickname: "TestUser2",
      email: "test2@test.com",
      dateOfBirth: "",
      gender: "",
      country: "",
      aboutMe: "",
      avatarUrl: null,
    },
    bio: {
      gameTimeFrom: "",
      gameTimeTo: "",
      games: "",
      gameGenres: "",
      lookingFor: "",
      platform: "",
      intensity: "",
    },
  },
};

// Fast lookup: numeric ID → user object
function getUserById(id) {
  return Object.values(users).find(u => u.id === id) ?? null;
}

// Fast lookup: numeric ID → email
function getEmailById(id) {
  const entry = Object.entries(users).find(([, u]) => u.id === id);
  return entry ? entry[0] : null;
}

function getUserEmail(req) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "mysecret");
    return decoded.email;
  } catch {
    return null;
  }
}

// Save uploaded avatars to public/assets/avatars with a timestamp prefix
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "public/assets/avatars"));
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (user && user.password === password) {
    console.log("Valid login:", email);
    const jwtToken = jwt.sign({ email }, "mysecret", { expiresIn: '2m' });
    res.status(200).send({ token: jwtToken });
  } else {
    console.log("Invalid login:", email);
    res.status(401).send({ message: "Invalid email or password" });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { nickname, email, password } = req.body;
  if (nickname && email && password) {
    users[email] = {
      id: nextUserId++,
      password,
      connections: [],
      profile: { nickname, email, dateOfBirth: "", gender: "", country: "", aboutMe: "", avatarUrl: null },
      bio: { gameTimeFrom: "", gameTimeTo: "", games: "", gameGenres: "", lookingFor: "", platform: "", intensity: "" },
    };
    console.log("Registered:", email);
    const jwtToken = jwt.sign({ email }, "mysecret", { expiresIn: '2m' });
    res.status(200).send({ token: jwtToken });
  } else {
    res.status(401).send({ message: "Invalid register data" });
  }
});

app.get('/me/profile', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });
  res.status(200).send(users[email].profile);
});

app.patch('/api/profile', upload.single('profilePicture'), (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const profile = users[email].profile;
  const { nickname, email: newEmail, dateOfBirth, gender, country, aboutMe } = req.body;
  if (nickname) profile.nickname = nickname;
  if (newEmail) profile.email = newEmail;
  if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
  if (gender) profile.gender = gender;
  if (country) profile.country = country;
  if (aboutMe) profile.aboutMe = aboutMe;
  if (req.file) profile.avatarUrl = `/assets/avatars/${req.file.filename}`;

  console.log("Profile updated for", email, profile);
  res.status(200).send({ message: "Profile updated successfully" });
});

app.get('/me/bio', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });
  res.status(200).send(users[email].bio);
});

app.patch('/api/bio', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const bio = users[email].bio;
  const { gameTimeFrom, gameTimeTo, games, gameGenres, lookingFor, platform, intensity } = req.body;
  if (gameTimeFrom) bio.gameTimeFrom = gameTimeFrom;
  if (gameTimeTo) bio.gameTimeTo = gameTimeTo;
  if (games) bio.games = games;
  if (gameGenres) bio.gameGenres = gameGenres;
  if (lookingFor) bio.lookingFor = lookingFor;
  if (platform) bio.platform = platform;
  if (intensity) bio.intensity = intensity;

  console.log("Bio updated for", email, bio);
  res.status(200).send({ message: "Bio updated successfully" });
});

const matchCandidates = [
  { id: 1,  nickname: "StarPlayer99",   avatarUrl: null, country: "Estonia",     dateOfBirth: "1998-04-12", games: "Valorant, CS2",              gameGenres: "FPS",            platform: "pc",          lookingFor: "for-play",        intensity: "8", gameTimeFrom: "20:00", gameTimeTo: "00:00" },
  { id: 2,  nickname: "NightOwlGamer",  avatarUrl: null, country: "Finland",     dateOfBirth: "2001-11-30", games: "League of Legends, Dota 2",  gameGenres: "MOBA, Strategy", platform: "pc",          lookingFor: "for-play",        intensity: "6", gameTimeFrom: "21:00", gameTimeTo: "02:00" },
  { id: 3,  nickname: "CasualAce",      avatarUrl: null, country: "Latvia",      dateOfBirth: "1995-07-22", games: "Minecraft, Stardew Valley",  gameGenres: "Casual, Sandbox",platform: "pc",          lookingFor: "for-friendship",  intensity: "3", gameTimeFrom: "14:00", gameTimeTo: "18:00" },
  { id: 4,  nickname: "FragMaster",     avatarUrl: null, country: "Lithuania",   dateOfBirth: "2000-03-15", games: "CS2, Valorant",              gameGenres: "FPS, Tactical",  platform: "pc",          lookingFor: "for-play",        intensity: "9", gameTimeFrom: "19:00", gameTimeTo: "23:00" },
  { id: 5,  nickname: "PixelWitch",     avatarUrl: null, country: "Poland",      dateOfBirth: "1997-08-20", games: "Stardew Valley, Minecraft",  gameGenres: "Casual, Sandbox",platform: "pc",          lookingFor: "for-friendship",  intensity: "4", gameTimeFrom: "17:00", gameTimeTo: "21:00" },
  { id: 6,  nickname: "TankGod",        avatarUrl: null, country: "Germany",     dateOfBirth: "1996-12-01", games: "World of Warcraft, Dota 2",  gameGenres: "MOBA, RPG",      platform: "pc",          lookingFor: "for-play",        intensity: "7", gameTimeFrom: "20:00", gameTimeTo: "01:00" },
  { id: 7,  nickname: "ConsolePro",     avatarUrl: null, country: "Sweden",      dateOfBirth: "2002-06-10", games: "FIFA, Call of Duty",         gameGenres: "Sports, FPS",    platform: "playstation", lookingFor: "for-play",        intensity: "6", gameTimeFrom: "18:00", gameTimeTo: "22:00" },
  { id: 8,  nickname: "MidLaner",       avatarUrl: null, country: "Estonia",     dateOfBirth: "1999-02-28", games: "League of Legends, Valorant",gameGenres: "MOBA, FPS",      platform: "pc",          lookingFor: "for-play",        intensity: "8", gameTimeFrom: "21:00", gameTimeTo: "02:00" },
  { id: 9,  nickname: "SpeedRunner",    avatarUrl: null, country: "Netherlands", dateOfBirth: "2003-09-05", games: "Minecraft, CS2",             gameGenres: "Sandbox, FPS",   platform: "pc",          lookingFor: "for-friendship",  intensity: "5", gameTimeFrom: "15:00", gameTimeTo: "19:00" },
  { id: 10, nickname: "RankedClimber",  avatarUrl: null, country: "Latvia",      dateOfBirth: "1994-11-17", games: "Valorant, League of Legends",gameGenres: "FPS, MOBA",      platform: "pc",          lookingFor: "for-play",        intensity: "9", gameTimeFrom: "22:00", gameTimeTo: "03:00" },
];

app.get('/api/matches', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const { profile, bio } = users[email];

  const requiredBioFields = ["platform", "lookingFor", "games", "gameGenres", "intensity", "gameTimeFrom", "gameTimeTo"];
  const requiredProfileFields = ["dateOfBirth", "gender", "country", "aboutMe"];
  const missingFields = [
    ...requiredProfileFields.filter(field => !profile[field]),
    ...requiredBioFields.filter(field => !bio[field]),
  ];
  if (missingFields.length > 0) {
    return res.status(200).send({ profileComplete: false, missingFields, matches: [] });
  }

  function overlap(a, b) {
    const setA = a.split(",").map(s => s.trim().toLowerCase());
    const setB = b.split(",").map(s => s.trim().toLowerCase());
    return setA.some(item => setB.includes(item));
  }

  const enriched = matchCandidates.map(candidate => {
    const matchedFields = [];
    if (bio.platform && candidate.platform && bio.platform === candidate.platform)
      matchedFields.push("platform");
    if (bio.lookingFor && candidate.lookingFor && bio.lookingFor === candidate.lookingFor)
      matchedFields.push("lookingFor");
    if (bio.games && candidate.games && overlap(bio.games, candidate.games))
      matchedFields.push("games");
    if (bio.gameGenres && candidate.gameGenres && overlap(bio.gameGenres, candidate.gameGenres))
      matchedFields.push("gameGenres");
    if (bio.intensity && candidate.intensity && Math.abs(Number(bio.intensity) - Number(candidate.intensity)) <= 2)
      matchedFields.push("intensity");
    return { ...candidate, matchedFields };
  }).filter(candidate =>
    candidate.matchedFields.length >= 2 &&
    Math.abs(Number(bio.intensity) - Number(candidate.intensity)) <= 2
  );

  res.status(200).send({ profileComplete: true, matches: enriched });
});

app.get('/api/connections', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const connected = users[email].connections.map(id => {
    // Real user (ID >= 101)
    const realUser = getUserById(id);
    if (realUser) {
      const realEmail = getEmailById(id);
      return {
        id,
        nickname: realUser.profile.nickname || realEmail,
        avatarUrl: realUser.profile.avatarUrl,
        country: realUser.profile.country,
        dateOfBirth: realUser.profile.dateOfBirth,
        isOnline: onlineUsers.has(realEmail),
      };
    }
    // Candidate (ID 1-10)
    const candidate = matchCandidates.find(c => c.id === id);
    if (candidate) return { ...candidate, isOnline: false };
    return null;
  }).filter(Boolean);

  res.status(200).send(connected);
});

app.post('/api/connections/:id', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const id = Number(req.params.id);
  if (!users[email].connections.includes(id)) {
    users[email].connections.push(id);
  }

  res.status(200).send({ message: "Connected" });
});

app.delete('/api/connections/:id', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const id = Number(req.params.id);

  // Remove from current user's connections
  users[email].connections = users[email].connections.filter(c => c !== id);

  // Remove from the other user's connections too (if real user)
  const otherUser = getUserById(id);
  const currentUser = users[email];
  if (otherUser) {
    otherUser.connections = otherUser.connections.filter(c => c !== currentUser.id);

    // Delete message history between the two users
    const otherEmail = Object.keys(users).find(e => users[e].id === id);
    if (otherEmail) {
      const key = conversationKey(email, otherEmail);
      delete messages[key];

      // Notify the other user via WebSocket
      const otherWs = onlineUsers.get(otherEmail);
      if (otherWs && otherWs.readyState === 1) {
        otherWs.send(JSON.stringify({ type: "dismissed", userId: currentUser.id }));
      }
    }
  } else {
    // Candidate — delete candidate conversation history
    const key = conversationKey(email, `candidate:${id}`);
    delete messages[key];
  }

  res.status(200).send({ message: "Dismissed" });
});

// Notify all real users who have `email` in their connections list
function broadcastStatus(email, isOnline) {
  const user = users[email];
  if (!user) return;
  const statusMsg = JSON.stringify({ type: "status", userId: user.id, isOnline });
  Object.entries(users).forEach(([otherEmail, otherUser]) => {
    if (otherEmail === email) return;
    if (otherUser.connections.includes(user.id)) {
      const otherWs = onlineUsers.get(otherEmail);
      if (otherWs && otherWs.readyState === 1) otherWs.send(statusMsg);
    }
  });
}

// --- WebSocket ---
wss.on("connection", (ws) => {
  let userEmail = null;

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // First message must be auth
    if (msg.type === "auth") {
      try {
        const decoded = jwt.verify(msg.token, "mysecret");
        userEmail = decoded.email;
        onlineUsers.set(userEmail, ws);
        broadcastStatus(userEmail, true);
      } catch {
        ws.close();
      }
      return;
    }

    if (!userEmail) return;

    // Sending a chat message
    if (msg.type === "message") {
      const recipientId = Number(msg.to);
      const senderUser = users[userEmail];

      // --- Real user → real user ---
      const recipientUser = getUserById(recipientId);
      if (recipientUser) {
        const recipientEmail = getEmailById(recipientId);
        const key = conversationKey(userEmail, recipientEmail);
        if (!messages[key]) messages[key] = [];

        const entry = { from: userEmail, senderId: senderUser.id, recipientId, text: msg.text, timestamp: new Date().toISOString() };
        messages[key].push(entry);

        // Echo to sender
        ws.send(JSON.stringify({ type: "message", ...entry }));

        // Deliver to recipient if online
        const recipientWs = onlineUsers.get(recipientEmail);
        if (recipientWs && recipientWs.readyState === 1) {
          recipientWs.send(JSON.stringify({ type: "message", ...entry }));
        }
        return;
      }

      // --- Real user → candidate (bot) ---
      const candidate = matchCandidates.find(c => c.id === recipientId);
      if (!candidate) return;

      const key = conversationKey(userEmail, `candidate:${recipientId}`);
      if (!messages[key]) messages[key] = [];

      const entry = { from: userEmail, senderId: senderUser.id, recipientId, text: msg.text, timestamp: new Date().toISOString() };
      messages[key].push(entry);

      ws.send(JSON.stringify({ type: "message", ...entry }));

      if (onlineCandidateIds.has(recipientId)) {
        const replyText = botReplies[Math.floor(Math.random() * botReplies.length)];
        const delay = 1000 + Math.random() * 2000;
        setTimeout(() => {
          const reply = { from: `candidate:${recipientId}`, senderId: recipientId, recipientId: senderUser.id, text: replyText, timestamp: new Date().toISOString() };
          messages[key].push(reply);
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: "message", ...reply }));
        }, delay);
      }
    }
  });

  ws.on("close", () => {
    if (userEmail) {
      onlineUsers.delete(userEmail);
      broadcastStatus(userEmail, false);
    }
  });
});

// --- Message history ---
app.get('/api/messages/:targetId', (req, res) => {
  const email = getUserEmail(req);
  if (!email || !users[email]) return res.status(401).send({ message: "Unauthorized" });

  const targetId = Number(req.params.targetId);
  const targetUser = getUserById(targetId);

  const key = targetUser
    ? conversationKey(email, getEmailById(targetId))
    : conversationKey(email, `candidate:${targetId}`);

  res.status(200).send(messages[key] ?? []);
});

server.listen(8080, () => console.log('API is running on http://localhost:8080'));

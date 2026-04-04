# Match Me — Gaming Connection Platform

A full-stack web application that matches gamers based on their profiles, preferences, and play schedules. Users can discover compatible players, send connection requests, and chat in real time.

---

## Project Overview

Match Me is a recommendation platform built for gamers. It collects biographical and preference data — games played, genres, platforms, play schedule, intensity, and more — and uses a scoring algorithm to surface the most compatible matches first. Location-based filtering ensures matches are practical.

Once connected, users can chat in real time. The platform includes an online/offline indicator, a typing indicator, and unread message notifications — all powered by WebSockets, not polling.

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security, Spring WebSocket |
| Database | PostgreSQL (JPA / Hibernate) |
| Auth | JWT (HS256), bcrypt password hashing |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| Real-time | STOMP over SockJS (WebSocket) |
| Geocoding | Nominatim (OpenStreetMap) — no API key required |

---

## Setup and Installation

### Prerequisites

- Java 21+
- Maven
- Node.js 18+ and npm
- PostgreSQL running locally

### 1. Database

Create the database and a user:

```sql
CREATE DATABASE webdb;
CREATE USER root WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE webdb TO root;
```

Hibernate will create the tables automatically on first run (`ddl-auto=update`).

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

Uploaded profile pictures are stored at `~/web/uploads/` and served at `/uploads/{filename}`.

> **Note:** The default `application.properties` contains hardcoded credentials (`root`/`root`) and a placeholder JWT secret. These are fine for local development but must be changed before any public deployment.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies API calls to `localhost:8080`.

---

## Usage Guide

### First Run — Seed Data

The application ships with a seed endpoint that loads **120 fictitious users** with varied profiles, locations, and preferences:

```
POST http://localhost:8080/api/seed
```

To **drop and reload** seed users (for a clean demo):

```
DELETE http://localhost:8080/api/seed
POST  http://localhost:8080/api/seed
```

Seed users have emails `test10@test.com` through `test129@test.com`, all with password `1234`.

The seed endpoint is idempotent — it skips creation if 100+ users already exist.

### Registration and Login

- Register at `/register` with a unique email and password.
- Log in at `/login`. A JWT is issued and stored in memory for the session.
- Log out from the header menu on any page.

### Completing Your Profile

You must fill in all required fields before recommendations appear:

- Date of birth
- Games you play
- Game genres
- Platform(s)
- What you're looking for
- Play intensity (1–10)
- Play time range and timezone
- About me

The profile page is split into three tabs: **Bio** (personal info + location), **Preferences** (gaming preferences + match filters), and **Account** (email, nickname, password).

### Location

On the Bio tab, click **"Detect my location"** to use your browser's GPS. The city and country are filled automatically via reverse geocoding (Nominatim). You can also search for a city manually using the autocomplete field, or edit the detected city and country directly.

Only your city and country are shown to other users — coordinates are never exposed.

On the Preferences tab, set a **maximum match distance (km)**. Only users within that radius of each other are considered compatible.

### Recommendations

Once your profile is complete, the Matcher page shows up to 10 recommended users, best match first. Each card shows shared games, genres, platforms and other matching points.

Dismiss a recommendation with the ✕ button — it will never appear again. Send a connection request with the connect button.

### Connections

The Connections page has three tabs:

- **Connections** — accepted connections, with a link to open chat
- **Pending** — incoming requests you can accept or reject
- **Sent** — outgoing requests you can cancel

### Chat

Chat is only available between connected users. Open a chat from the Connections page or directly from a connected user's profile. Messages are delivered in real time. Unread messages are flagged with an indicator that clears when you open the chat.

---

## Matching Algorithm

Compatibility is calculated in two stages.

**Hard filters — a candidate is excluded entirely if any of these fail:**

1. **Location** — both users must be within each other's maximum distance radius (Haversine formula). Users without GPS coordinates are not restricted by distance.
2. **Gender preference** — if the viewer has a preferred gender set, the candidate must match.
3. **Age preference** — if the viewer has set a minimum or maximum age, the candidate must fall within that range.
4. **Time overlap** — play schedules are converted to UTC and must overlap by at least one minute. A night-shift player and a morning player will not be matched.

**Score (higher = better match):**

| Factor | Points |
|---|---|
| Each minute of overlapping play time | +1 |
| Each game in common | +30 |
| Each genre in common | +20 |
| Each platform in common | +20 |
| Each shared "looking for" value | +15 |
| Exact play intensity match | +50 |
| Same timezone | +30 |

Users with a score of zero (no meaningful overlap) are filtered out before the list is returned.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/{id}` | Name and profile picture link |
| GET | `/api/users/{id}/profile` | About me information |
| GET | `/api/users/{id}/bio` | Biographical data (public, no preferences) |
| GET | `/api/me` | 302 redirect → `/api/users/{id}` |
| GET | `/api/me/bio` | Full bio including private preferences (owner only) |
| GET | `/api/me/profile` | 302 redirect → `/api/users/{id}/profile` |
| GET | `/api/recommendations` | Up to 10 recommended user IDs |
| GET | `/api/connections` | List of accepted connection user IDs |

Profile endpoints return HTTP 404 for both "not found" and "not permitted" — a caller cannot distinguish between the two, preventing profile enumeration.

The `/recommendations` and `/connections` endpoints return lists of IDs only. The frontend fetches full user data in follow-up calls per the spec's intended usage pattern.

---

## Bonus Features

### Proximity-Based Location Filtering

Location data is collected from the browser's Geolocation API and stored as GPS coordinates. Distance between users is calculated using the Haversine formula. Each user sets a maximum radius in their preferences; both users' limits must be satisfied for a match to be possible.

City names are resolved from coordinates using Nominatim reverse geocoding, and a city autocomplete search is available as an alternative to GPS detection.

### Online / Offline Indicator

A green dot appears on user cards and chat views when a user is currently connected. Status is broadcast over WebSocket when users connect and disconnect.

### Typing Indicator

When a user begins typing in a chat, the recipient sees a "typing..." indicator. It disappears automatically if the user stops typing for two seconds.

### Real-Time Chat

All chat messages, unread notifications, connection updates, and status changes are delivered over a persistent WebSocket connection (STOMP over SockJS). There is no polling anywhere in the application.

---

## Known Limitations

As a learning project built by beginner developers, there are areas that a production system would handle differently:

- **No automated tests.** The application has been manually tested but has no unit or integration test suite.
- **In-memory candidate scoring.** The matching service loads all users from the database to compute scores. This works well for hundreds of users but would not scale to tens of thousands without database-level filtering.
- **Hardcoded configuration.** Database credentials and the JWT secret are stored in `application.properties`. A production deployment would use environment variables or a secrets manager.
- **The seed endpoint is unprotected.** `POST /api/seed` and `DELETE /api/seed` require no authentication. This is intentional for review convenience but would be removed or secured in production.

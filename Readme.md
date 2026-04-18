# GameMe — Gaming Connection Platform

A full-stack web application that matches gamers based on shared games, schedules, and preferences. Users discover compatible players, send connection requests, and chat in real time.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Load Test Data](#load-test-data)
- [Using the App](#using-the-app)
- [Matching Algorithm](#matching-algorithm)
- [API Reference](#api-reference)
- [Known Limitations](#known-limitations)
- [Testing Guide](#testing-guide)

---

## Overview

GameMe helps gamers find compatible teammates. It collects biographical and gaming preference data — games played, genres, platforms, play schedule, intensity — and uses a scoring algorithm to surface the most compatible matches first. Location-based filtering ensures matches are practical.

Once connected, users can chat in real time. The platform includes an online/offline indicator, a typing indicator, and unread message notifications — all powered by WebSockets, not polling.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 4.0.3, Spring Security, Spring WebSocket |
| Database | PostgreSQL (JPA / Hibernate, schema auto-created on first run) |
| Auth | JWT (HS256), bcrypt password hashing |
| Frontend | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4 |
| Routing | React Router 7 |
| Real-time | STOMP over SockJS (WebSocket) — no polling |
| GraphQL | Spring for GraphQL 2.0.2, GraphiQL playground |

---

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 20+ and npm
- PostgreSQL running locally

---

## Setup

### 1. Database

Open a PostgreSQL client and run:

```sql
CREATE DATABASE webdb;
CREATE USER root WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE webdb TO root;
```

Hibernate creates all tables automatically on first start — no migration scripts needed.

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

To run in **developer mode** (enables GraphQL Playground):
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=-d
```

The backend starts on **http://localhost:8080**.

Uploaded profile pictures are stored at `~/web/uploads/` and served at `/uploads/{filename}`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies all `/api` requests to the backend automatically — no CORS configuration needed during development.

---

## Load Test Data

The app ships with a seed endpoint that creates **120 fictitious users** with varied profiles, locations, games, and schedules:

```
POST http://localhost:8080/api/seed
```

Seed users have emails `test10@test.com` through `test129@test.com`, all with password `1234`.

To wipe and reload:
```
DELETE http://localhost:8080/api/seed
POST   http://localhost:8080/api/seed
```

The endpoint is idempotent — it skips creation if 100+ users already exist.

> The seed endpoint requires no authentication. This is intentional for review and development convenience.

---

## Using the App

### Registration and Login

Register at `/register` with a unique email and password. After registering you are taken directly to the Profile page. Log out at any time from the top-right menu.

### Completing Your Profile

The Profile page has three tabs:

**Account tab** — credentials and profile picture:
- Update nickname, email, or password
- Upload or remove a profile picture (JPEG/PNG, max 5 MB)

**Bio tab** — personal information:
- Date of birth and gender
- Location (see below)
- Play time range and timezone
- About me (free text)

**Preferences tab** — gaming preferences and match filters:
- Games, genres, platforms
- Play intensity (1–10)
- What you're looking for (e.g. "Just gaming", "Friendship")
- Preferred genders, age range, and maximum match distance

The app will not show recommendations until all required fields are filled in. A message on the Matcher page lists exactly which fields are still missing.

### Location

On the Bio tab, click **"Detect my location"** to use the browser's GPS. City and country are filled automatically via reverse geocoding (Nominatim/OpenStreetMap — no API key needed). You can also search for a city manually using the autocomplete field.

Set a **maximum match distance (km)** on the Preferences tab. Only users within that radius of each other are shown as recommendations. Leave blank for no distance limit.

Only city and country names are visible to other users — GPS coordinates are never sent to the browser.

### Recommendations

Once your profile is complete, the **Matcher** page shows up to 10 recommended users, best match first. Each card displays a compatibility score and highlights which fields match (shared games, genres, platforms, schedule overlap, etc.).

- Click **Connect** to send a connection request.
- Click **Dismiss** to permanently remove a user from your recommendations.

The list updates in real time when another user accepts or rejects your request.

### Connections

The **Connections** page has three tabs:

| Tab | Contents |
|---|---|
| Connections | Accepted connections — click to open chat |
| Pending | Incoming requests — Accept or Reject |
| Sent | Outgoing requests — Cancel |

From a connected user's card you can also **Disconnect** or **Block** them.

### Chat

Chat is only available between connected users. Open a chat from the Connections page or from a connected user's profile page.

- Messages are delivered instantly via WebSocket.
- Each message shows the time (and date for older messages) it was sent.
- The sidebar lists chats ordered by most recently active.
- A red unread badge appears when new messages arrive in an inactive chat.
- The **online indicator** (green dot) shows who is currently connected.
- The **typing indicator** appears when the other user is composing a message.

Chat history is paginated — click **Load older messages** at the top of the conversation to fetch previous messages.

---

## Matching Algorithm

Compatibility is evaluated in two stages.

### Stage 1 — Hard Filters

A candidate is excluded entirely if any of these fail. All checks are applied in **both directions** — both users must satisfy each other's filters.

| Filter | Rule |
|---|---|
| Distance | Both users within each other's max radius (Haversine formula). Skipped if either has no GPS coordinates. |
| Gender preference | If a preferred gender is set, the candidate must match — and vice versa. |
| Age preference | If a preferred age range is set, the candidate must fall within it — and vice versa. |
| Time overlap | Play schedules converted to UTC must overlap by at least 1 minute. |

### Stage 2 — Scoring

Users who pass all filters are scored. Higher score = better match. Sorted descending, capped at 10 results.

| Factor | Points |
|---|---|
| Each minute of overlapping play time | +1 |
| Each game in common | +30 |
| Each genre in common | +20 |
| Each platform in common | +20 |
| Each shared "looking for" value | +15 |
| Exact intensity match | +50 |
| Same timezone | +30 |

Users scoring zero after all factors are excluded from results.

---

## GraphQL API

The GraphQL API exposes all server functionality via a single `/graphql` endpoint.

### Running the Playground

Start the backend in developer mode to enable the GraphiQL playground:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=-d
```

Open **http://localhost:8080/graphiql** in your browser.

Add your JWT token in the **Headers** tab:
```json
{ "Authorization": "Bearer YOUR_JWT_TOKEN" }
```

### Available Queries

```graphql
user(id: ID!): User
bio(id: ID!): Bio
profile(id: ID!): Profile
me: User
myBio: Bio
myProfile: Profile
recommendations: [User]
connections: [User]
incomingConnections: [User]
outgoingConnections: [User]
```

### Available Mutations

```graphql
updateAccount(input: UpdateAccountInput!): User
updateBio(input: UpdateBioInput!): Bio
updateProfile(aboutMe: String!): Profile
sendConnectionRequest(userId: ID!): Boolean
acceptConnection(userId: ID!): Boolean
rejectConnection(userId: ID!): Boolean
blockUser(userId: ID!): Boolean
removeConnection(userId: ID!): Boolean
setOnline: Boolean
setOffline: Boolean
```

### Subscription

```graphql
onlineStatus: OnlineStatus   # streams { userId, isOnline } when users go online/offline
```

### Example — Single Query for Recommendations

```graphql
{
  recommendations {
    id
    nickname
    profilePicture
    bio {
      country
      city
      preferences {
        gamePreference
        intensity
      }
    }
    profile {
      aboutMe
    }
  }
}
```

---

## API Reference

All endpoints except auth and seed require a valid JWT in the `Authorization: Bearer {token}` header.

Profile endpoints return **HTTP 404** for both "not found" and "not permitted" — callers cannot distinguish the two, which prevents profile enumeration.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/me` | Yes | 302 redirect → `/api/users/{id}` |
| GET | `/api/me/account` | Yes | Own email, nickname, picture URL |
| PUT | `/api/me/account` | Yes | Update email / password / nickname |
| GET | `/api/me/bio` | Yes | Full bio including private preferences |
| PUT | `/api/me/bio` | Yes | Update bio fields |
| POST | `/api/me/picture` | Yes | Upload profile picture |
| DELETE | `/api/me/picture` | Yes | Remove profile picture |
| GET | `/api/users/{id}` | Yes | Name + picture + resource links |
| GET | `/api/users/{id}/profile` | Yes | About me text |
| GET | `/api/users/{id}/bio` | Yes | Public biographical data |
| GET | `/api/recommendations` | Yes | Up to 10 recommended user IDs |
| GET | `/api/connections` | Yes | Connected user IDs |
| POST | `/api/connections/{id}/request` | Yes | Send connection request |
| POST | `/api/connections/{id}/accept` | Yes | Accept a request |
| DELETE | `/api/connections/{id}` | Yes | Reject, cancel, or disconnect |
| POST | `/api/connections/{id}/block` | Yes | Block a user |
| GET | `/api/messages/{userId}` | Yes | Paginated chat history (`?page=0&size=30`) |
| GET | `/api/social/missing-fields` | Yes | List of missing required profile fields |
| POST | `/api/seed` | No | Create 120 test users |
| DELETE | `/api/seed` | No | Delete test users |

---

## Testing Guide

A dedicated guide for code reviewers is available in **[TESTING.md](TESTING.md)**.

It covers every testing criterion in order, with a description of how each feature is implemented and step-by-step instructions for verifying it.


---

## License

This project is created for educational purposes.

---
## Authors
- Kirill Sergeev
- Jevgeni Vinogradov

---
**Last Updated:** April 05, 2026
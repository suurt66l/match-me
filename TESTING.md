# GameMe — GraphQL Testing Guide

This document covers every GraphQL testing criterion in order. Each item is collapsible — click to expand the description and verification steps.

Before testing, make sure the backend is running and test data is loaded. See **[Readme.md](Readme.md)** for setup instructions.

**Quick start:**
```
# Start backend in developer mode (required for GraphQL playground)
cd backend && mvn spring-boot:run -Dspring-boot.run.arguments=-d

# Load 120 test users (if not already loaded)
POST http://localhost:8080/api/seed

# Open GraphQL playground
http://localhost:8080/graphiql
```

**Authentication:**
All GraphQL queries require a JWT token. Add it in the **Headers** tab in GraphiQL:
```json
{ "Authorization": "Bearer YOUR_JWT_TOKEN" }
```

Get a token by calling `POST http://localhost:8080/api/auth/login` with `{ "email": "test10@test.com", "password": "1234" }`.

Test users: `test10@test.com` → `test129@test.com`, password: `1234`

---

## Mandatory Criteria

<details>
<summary><b>1. The GraphQL Playground is available in developer mode only.</b></summary>

**How it works:**
The server checks for a `-d` flag at startup. If present, it sets `spring.graphql.graphiql.enabled=true` before Spring initializes. Without the flag, the playground returns 404.

**How to verify:**
1. Start normally: `cd backend && mvn spring-boot:run`
2. Open **http://localhost:8080/graphiql** → **404 Not Found**
3. Stop the server. Start with flag: `mvn spring-boot:run -Dspring-boot.run.arguments=-d`
4. Open **http://localhost:8080/graphiql** → playground loads

</details>

---

<details>
<summary><b>2. The GraphQL and REST APIs both work at the same time.</b></summary>

**How it works:**
The GraphQL controller (`/graphql`) and all REST controllers (`/api/*`) run simultaneously on the same server. They share the same services and database.

**How to verify:**
With the server running in dev mode:

REST call:
```
GET http://localhost:8080/api/me
Authorization: Bearer {token}
```
→ Returns HTTP 302 redirect to `/api/users/{id}`

GraphQL call (in playground):
```graphql
{ me { id nickname email } }
```
→ Returns the same user's data

Both work simultaneously from the same server instance on port 8080.

</details>

---

<details>
<summary><b>3. The full REST server capability is available via the GraphQL API.</b></summary>

**How it works:**
Every REST operation has a GraphQL equivalent. Read operations are covered by queries, write operations by mutations. The GraphQL API uses the same underlying services as the REST API.

**REST → GraphQL mapping:**

| REST | GraphQL |
|---|---|
| GET /api/users/{id} | `user(id)` query |
| GET /api/users/{id}/bio | `bio(id)` query |
| GET /api/users/{id}/profile | `profile(id)` query |
| GET /api/me | `me` query |
| GET /api/me/bio | `myBio` query |
| GET /api/me/profile | `myProfile` query |
| GET /api/recommendations | `recommendations` query |
| GET /api/connections | `connections` query |
| PUT /api/me/account | `updateAccount` mutation |
| PUT /api/me/bio | `updateBio` mutation |
| PUT /api/me/profile | `updateProfile` mutation |
| POST /api/connections/request/{id} | `sendConnectionRequest` mutation |
| PUT /api/connections/accept/{id} | `acceptConnection` mutation |
| DELETE /api/connections/reject/{id} | `rejectConnection` mutation |
| POST /api/connections/block/{id} | `blockUser` mutation |
| DELETE /api/connections/with/{id} | `removeConnection` mutation |

</details>

---

<details>
<summary><b>4. The required types are available: User includes Bio and Profile, Bio and Profile include the respective User.</b></summary>

**How it works:**
The `User` type has `bio` and `profile` fields resolved via `@SchemaMapping`. The `Bio` and `Profile` types each have a `user` field — a `@SchemaMapping` resolver reads the `userId` stored in the DTO and fetches the owner from the database.

**How to verify:**

User → Bio → Profile:
```graphql
{
  me {
    id
    nickname
    email
    profilePicture
    bio {
      dateOfBirth
      gender
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
→ Returns a fully nested `User` with `bio` and `profile` populated.

Bio → User back-reference:
```graphql
{
  bio(id: 10) {
    country
    city
    user {
      id
      nickname
      email
    }
  }
}
```
→ The `user` field inside `bio` returns the owner of that bio.

Profile → User back-reference:
```graphql
{
  profile(id: 10) {
    aboutMe
    user {
      id
      nickname
    }
  }
}
```
→ The `user` field inside `profile` returns the owner of that profile.

</details>

---

<details>
<summary><b>5. The following queries have been implemented, and the correct types are returned.</b></summary>

Run each query in the playground with a valid JWT header:

**`user(id)` → User**
```graphql
{ user(id: 10) { id nickname bio { country } profile { aboutMe } } }
```

**`bio(id)` → Bio**
```graphql
{ bio(id: 10) { country city gender user { id } } }
```

**`profile(id)` → Profile**
```graphql
{ profile(id: 10) { aboutMe user { id } } }
```

**`me` → User**
```graphql
{ me { id nickname email } }
```

**`myBio` → Bio**
```graphql
{ myBio { gender country preferences { gamePreference intensity } } }
```

**`myProfile` → Profile**
```graphql
{ myProfile { aboutMe } }
```

**`recommendations` → [User]**
```graphql
{ recommendations { id nickname bio { country } } }
```

**`connections` → [User]**
```graphql
{ connections { id nickname } }
```

</details>

---

<details>
<summary><b>6. It's possible to get the name, profile picture url, about me and bio data for all recommendations in a single query.</b></summary>

**How it works:**
Because `User` contains nested `bio` and `profile` types, a single GraphQL query can fetch all recommendation data in one request — no follow-up calls needed.

**How to verify:**
Run this single query:
```graphql
{
  recommendations {
    id
    nickname
    profilePicture
    bio {
      dateOfBirth
      gender
      country
      city
      preferences {
        timeRange
        gamePreference
        gameGenrePreference
        platforms
        intensity
        lookingFor
      }
    }
    profile {
      aboutMe
    }
  }
}
```
→ Returns all recommendation data including name, picture URL, bio, and about me in **one request**.

</details>

---

## Extra Criteria

<details>
<summary><b>The GraphQL API is performant — it does not lag when querying nested types.</b></summary>

**How it works:**
Nested type resolvers (`Bio`, `Profile`, `Preferences`) do not make additional database calls. The `User` entity is loaded once and all nested data is extracted from that same object in memory. No N+1 query problem for bio and profile fields.

**How to verify:**
1. Run the full recommendations query above (fetching bio + profile for up to 10 users).
2. Observe response time in the playground — should return in under 500ms.
3. Check server logs — only one database query fires per user (the initial user fetch), not separate queries for bio or profile.

</details>

---

<details>
<summary><b>Some realtime functionality has been implemented using subscriptions.</b></summary>

**How it works:**
Online/offline status is streamed via a GraphQL subscription backed by Project Reactor's `Flux`. When `setOnline` or `setOffline` mutation is called (or a user connects/disconnects via WebSocket), an event is emitted into a `Sinks.Many` stream and delivered to all active GraphQL subscribers.

**How to verify:**
1. Open GraphiQL in **two separate browser tabs**, both with JWT headers (can use the same or different users).

2. In **Tab 1**, start the subscription:
```graphql
subscription {
  onlineStatus {
    userId
    isOnline
  }
}
```
Tab 1 is now listening for status events.

3. In **Tab 2**, run the mutation:
```graphql
mutation {
  setOnline
}
```

4. **Tab 1** immediately receives:
```json
{
  "data": {
    "onlineStatus": {
      "userId": "976",
      "isOnline": true
    }
  }
}
```

5. Run `setOffline` in Tab 2 — Tab 1 receives another event with `"isOnline": false`.

**Note:** GraphQL subscriptions use a WebSocket connection separate from the STOMP connection. The existing STOMP-based realtime (chat, typing indicator, connection notifications) continues to work alongside GraphQL subscriptions.

</details>
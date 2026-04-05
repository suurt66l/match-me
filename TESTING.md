# GameMe — Testing Guide

This document covers every testing criterion in order. Each item is collapsible — click to expand the description and verification steps.

Before testing, make sure both servers are running and test data is loaded. See **[Readme.md](Readme.md)** for setup instructions.

**Quick start:**
```
# 1. Start backend
cd backend && mvn spring-boot:run

# 2. Start frontend
cd frontend && npm start

# 3. Load 120 test users
POST http://localhost:8080/api/seed
```

Test users: `test10@test.com` → `test129@test.com`, password: `1234`

---

## Postman Collection

A ready-to-use Postman collection is included: **[GameMe.postman_collection.json](GameMe.postman_collection.json)**

**How to import:**
1. Open Postman → **Import** → select `GameMe.postman_collection.json`
2. Run **Seed → Create seed data** first
3. Run **Auth → Login** — the token is saved automatically to all requests
4. All other requests are pre-configured and ready to use

The collection is organized into folders: **Auth**, **Seed**, **Me**, **Users**, **Recommendations**, **Connections**, **Messages**.

---

<details>
<summary><b>1. It is possible to register with an email address and password.</b></summary>

**How it works:**
Registration requires a unique email and a password. The password is hashed with bcrypt before storage — plaintext is never saved.

**How to verify:**
1. Open **http://localhost:5173** and click **Register**.
2. Enter any email and password and submit.
3. You are redirected to the Profile page — registration was successful.
4. Try registering again with the same email — the app shows an error ("Email already in use").

</details>

---

<details>
<summary><b>2. The user can log out.</b></summary>

**How it works:**
The JWT is held in memory (not localStorage or cookies). Logging out clears the token — no further authenticated requests can be made.

**How to verify:**
1. Log in to any account.
2. Click your avatar in the top-right corner → **Sign out**.
3. You are redirected to the login page.
4. Navigate to **http://localhost:5173/matcher** — you are sent back to `/login`.

</details>

---

<details>
<summary><b>3. The application works with a single user.</b></summary>

**How it works:**
The app does not require multiple users to function. The Matcher simply shows an empty state when no compatible users exist.

**How to verify:**
1. Delete seed data first: `DELETE http://localhost:8080/api/seed`
2. Register a single new user and complete the profile.
3. Go to the **Matcher** page — it loads without errors and shows a "No recommendations found" message.
4. All other pages (Connections, Chat, Profile) load and work normally.

</details>

---

<details>
<summary><b>4. It refuses to recommend an obviously poor match.</b></summary>

**How it works:**
Users are excluded from recommendations if they share no gaming attributes and have no schedule overlap. A score of zero means no match.

**How to verify:**
1. Delete seed data: `DELETE http://localhost:8080/api/seed`
2. Register **User A** with this profile:
   - Games: World of Warcraft 
   - Genres: MMO, RPG 
   - Platform: Nintendo Switch
   - Play time: 08:00–14:00, timezone UTC+9 
   - Intensity: 9
3. Register **User B** with this profile:
   - Games: Valorant 
   - Genres: FPS, Battle Royale 
   - Platform: PC
   - Play time: 20:00–02:00, timezone UTC-5 
   - Intensity: 2
4. Log in as User A → **Matcher** page.
5. User B does not appear — no shared games, genres, platforms, or overlapping play time results in a score of zero, which is filtered out.

</details>

---

<details>
<summary><b>5. It recommends obviously good matches.</b></summary>

**How it works:**
Users with many shared attributes and overlapping play schedules score high and appear at the top of each other's recommendations.

**How to verify:**
1. Delete seed data: `DELETE http://localhost:8080/api/seed`
2. Register **User A** with this profile:
   - Games: Valorant, CS2 
   - Genres: FPS, Battle Royale 
   - Platform: PC
   - Play time: 16:00–22:00, timezone UTC+2 
   - Intensity: 7
3. Register **User B** with an identical or near-identical profile.
4. Log in as User A → **Matcher** page.
5. User B appears as the top recommendation with a high score.

</details>

---

<details>
<summary><b>6. The user is not shown any recommendations until they have completed their profile.</b></summary>

**How it works:**
The backend checks for missing required fields before returning recommendations. The frontend shows a message listing exactly what is still missing.

**How to verify:**
1. Register a new account — do not fill in any profile fields.
2. Go to the **Matcher** page immediately.
3. A message appears listing the missing fields. No cards are shown.
4. Fill in all required fields on the Profile page and save.
5. Return to Matcher — recommendations now appear.

</details>

---

<details>
<summary><b>7. The user has a minimum of 5 biographical points to configure.</b></summary>

**How it works:**
The profile is split across two tabs with 9 configurable biographical fields — well above the minimum of 5.

**Available fields:**

| Field | Tab |
|---|---|
| Date of birth | Bio |
| Gender | Bio |
| Play time range (e.g. 16:00–22:00) | Bio |
| Timezone | Bio |
| About me (free text) | Bio |
| Games you play | Preferences |
| Game genres | Preferences |
| Platform(s) | Preferences |
| Play intensity (1–10) | Preferences |

**How to verify:**
Go to **Profile → Bio tab** and **Profile → Preferences tab** and count the distinct editable fields.

</details>

---

<details>
<summary><b>8. The user can change their biographical data.</b></summary>

**How it works:**
All bio and preference fields are editable at any time. Changes are saved immediately to the database and affect future recommendation calculations.

**How to verify:**
1. Go to **Profile → Preferences tab**.
2. Change the "Games you play" field.
3. Click **Save**.
4. Refresh the page — the updated value is shown.
5. Go to the Matcher — recommendations now reflect the new preferences.

</details>

---

<details>
<summary><b>9. The user can specify preferences for target biographical data points.</b></summary>

**How it works:**
On the Preferences tab, users set filters that control who they are matched with. Filters are applied in both directions — both users must satisfy each other's preferences.

**Available preference filters:**

| Filter | Effect |
|---|---|
| Preferred genders | Only match users of the selected gender(s). Empty = any gender. |
| Preferred age min / max | Only match users within this age range. Empty = no limit. |
| Maximum match distance (km) | Only match users within this radius. Empty = no limit. |

**How to verify:**
1. Go to **Profile → Preferences tab**.
2. Set "Preferred genders" to a specific value and save.
3. Go to the Matcher — only users of that gender appear.
4. Clear the filter and save — users of all genders appear again.

</details>

---

<details>
<summary><b>10. A profile picture can be set.</b></summary>

**How it works:**
Users upload a JPEG or PNG image (max 5 MB). The file is stored on the server and the URL is saved in the database. The picture appears in the header, on match cards, and in chat.

**How to verify:**
1. Go to **Profile → Account tab**.
2. Click **Upload picture** and select any image file.
3. The picture appears in the page header and on your profile immediately.

</details>

---

<details>
<summary><b>11. The profile picture can be removed or changed.</b></summary>

**How it works:**
Uploading a new picture replaces the existing one. Removing it clears the stored URL and the avatar reverts to the default placeholder.

**How to verify:**
1. Upload a profile picture (see criterion 10).
2. On **Profile → Account tab**, click **Remove picture** — the avatar reverts to the default.
3. Upload a different picture — it replaces the previous one.

</details>

---

<details>
<summary><b>12. The email address is not shown, except to the owner of the profile.</b></summary>

**How it works:**
The email field is excluded from all public-facing API responses. It is only returned by `GET /api/me/account`, which is always scoped to the authenticated user's own data.

**How to verify:**

Call these endpoints with a valid token and inspect the responses:

```
GET /api/users/{id}          → no email field
GET /api/users/{id}/profile  → no email field
GET /api/users/{id}/bio      → no email field
GET /api/me/account          → includes email (own user only)
```

</details>

---

<details>
<summary><b>13. The user can specify a location or preferred distance for matches.</b></summary>

**How it works:**
Location can be set via GPS or city search. GPS coordinates are stored server-side. Other users only ever see the city and country name.

**How to verify:**
1. Go to **Profile → Bio tab**.
2. Click **"Detect my location"** — the browser asks for GPS permission, then fills in city and country automatically (Nominatim/OpenStreetMap, no API key needed).
3. Alternatively, type a city name in the autocomplete field and select a result.
4. Go to **Profile → Preferences tab** and set **Maximum match distance (km)** (e.g. 200).
5. Save — the distance filter is now active.

</details>

---

<details>
<summary><b>14. The user only sees recommendations from their location.</b></summary>

**How it works:**
Distance between users is calculated using the Haversine formula on stored GPS coordinates. A match only appears if both users are within each other's maximum radius.

**How to verify:**
1. Set your location to Tallinn, Estonia and max distance to 200 km.
2. Load seed data — it includes users across Estonia, Germany, USA, Japan, etc.
3. Go to the Matcher — only users near Tallinn appear. Users in Japan or the USA do not.
4. Remove the max distance limit — distant users may now appear.

</details>

---

<details>
<summary><b>15. The user can see a list of no more than 10 recommendations at a time.</b></summary>

**How it works:**
The backend caps results at 10 IDs. No matter how many compatible users exist, `GET /api/recommendations` returns at most 10.

**How to verify:**
1. Load seed data and complete your profile.
2. Go to the Matcher — at most 10 cards are shown.
3. Call `GET /api/recommendations` directly — the response array has 10 or fewer items.

</details>

---

<details>
<summary><b>16. The recommendations are prioritized with the best first.</b></summary>

**How it works:**
Candidates are scored and sorted descending before being returned. The first card always has the highest compatibility score.

**How to verify:**
On the Matcher page, each card shows a **compatibility score** in the top-right corner. Verify that scores decrease from the first card to the last. The score breakdown on each card shows exactly why each score was given.

</details>

---

<details>
<summary><b>17. The recommendations behave in line with the student's described matching logic.</b></summary>

**How it works:**
Hard filters eliminate incompatible users (distance, gender, age, time overlap). Scoring then ranks the remaining candidates by shared gaming attributes and schedule overlap. Both stages are applied bidirectionally.

See the **Matching Algorithm** section in [Readme.md](Readme.md) for the full scoring table.

**How to verify:**
Create two users and manually calculate the expected score using the scoring table. Compare with the score shown on the Matcher card — they should match.

</details>

---

<details>
<summary><b>18. It is possible to dismiss a recommendation. That recommendation is not shown again after it is dismissed.</b></summary>

**How it works:**
Dismissing records the pair in the database. The dismissed user is permanently excluded from recommendations — they will not return even after logging out and back in.

**How to verify:**
1. Go to the Matcher page.
2. Note a user's name, then click **Dismiss**.
3. The card disappears immediately.
4. Refresh the page — the dismissed user does not return.
5. Log out and log back in — still not there.

</details>

---

<details>
<summary><b>19. Connection requests can be sent.</b></summary>

**How it works:**
Clicking **Connect** sends a connection request stored in the database with a "pending" status. The recipient is notified in real time via WebSocket.

**How to verify:**
1. Go to the Matcher and click **Connect** on any card.
2. Open a second browser (or private window) and log in as the recipient (`test10@test.com` / `1234`).
3. Go to **Connections → Pending tab** — the request appears immediately without refreshing the page.

</details>

---

<details>
<summary><b>20. Incoming connection requests can be rejected.</b></summary>

**How it works:**
Rejecting deletes the connection record. The requester is notified in real time.

**How to verify:**
1. Send a request from Account A to Account B.
2. Log in as Account B → **Connections → Pending tab** → click **Reject**.
3. Switch to Account A — the Matcher page updates in real time without a page refresh.

</details>

---

<details>
<summary><b>21. Incoming connection requests can be accepted.</b></summary>

**How it works:**
Accepting changes the connection status to "accepted". Both users appear in each other's Connections tab and can now open a chat. Both are notified via WebSocket.

**How to verify:**
1. Send a request from Account A to Account B.
2. Log in as Account B → **Connections → Pending tab** → click **Accept**.
3. Both accounts now show each other in **Connections → Connections tab**.
4. The **"Open chat"** button is now available on both sides.

</details>

---

<details>
<summary><b>22. Users can only see profile information when properly allowed.</b></summary>

**How it works:**
A user can view another user's profile only in three situations:
- The other user appears in their recommendations.
- There is an outstanding connection request between them (either direction).
- They are connected.

All other cases return **HTTP 404** — identical to a non-existent user. This prevents profile enumeration.

**How to verify:**
1. Find the ID of a user you have no relationship with.
2. Call `GET /api/users/{id}` with your token → **404**.
3. Send a connection request to that user (they must appear in your recommendations).
4. Call `GET /api/users/{id}` again → **200** with their profile data.

</details>

---

<details>
<summary><b>23. It is possible to disconnect with a user.</b></summary>

**How it works:**
Disconnecting removes the connection record. Both users lose access to each other's profile (back to 404) and the chat becomes inaccessible. The other user is notified via WebSocket.

A **Block** option is also available — it creates a blocked status, preventing the blocked user from finding you in recommendations or sending requests.

**How to verify:**
1. Connect with another user (see criteria 19–21).
2. On the Connections page, find that user and click **Disconnect**.
3. The user disappears from the Connections list.
4. Call `GET /api/users/{id}` for that user → **404** again.
5. The other account sees the update in real time — no page refresh needed.

</details>

---

<details>
<summary><b>24. Chat is only possible between connected profiles.</b></summary>

**How it works:**
The chat UI only shows a chat option for connected users. The backend also enforces this — `GET /api/messages/{userId}` returns 403 if no accepted connection exists.

**How to verify:**
1. Find a user you are not connected with (e.g. someone in recommendations or a pending request).
2. There is no chat button visible anywhere in the UI for that user.
3. Call `GET /api/messages/{userId}` directly → **403**.
4. Accept a connection with a different user — the chat button appears.

</details>

---

<details>
<summary><b>25. Chats are ordered with the most recently active chat first.</b></summary>

**How it works:**
The chat sidebar sorts conversations by the timestamp of the most recent message. The conversation with the most recent activity is always at the top.

**How to verify:**
1. Connect with at least two users and exchange messages with both.
2. Send a new message to the user currently lower in the sidebar list.
3. That conversation moves to the top immediately.

</details>

---

<details>
<summary><b>26. Chat messages feature a date and time.</b></summary>

**How it works:**
Each message is stored with a timestamp. In the UI, today's messages show the time only. Older messages show the full date and time.

**How to verify:**
Open any chat conversation. Each message has a timestamp displayed next to it (e.g. "14:32" for a message sent today, "Apr 3, 12:10" for an older one).

</details>

---

<details>
<summary><b>27. A chat history can be reached from the connected user's profile.</b></summary>

**How it works:**
A connected user's profile page shows an **"Open chat"** button that navigates directly to the conversation.

**How to verify:**
1. Connect with another user.
2. Open their profile (click their name or avatar from the Connections page).
3. An **"Open chat"** button is visible on the profile page.
4. Clicking it navigates to the chat with that user.

</details>

---

<details>
<summary><b>28. Both users see the same chat history.</b></summary>

**How it works:**
Messages are stored in the database and fetched from the server — there is no local-only state. Both users always read from the same source.

**How to verify:**
1. Send several messages between two accounts (two browsers).
2. Log out and back in on either account.
3. Open the same chat — the full history is there, identical on both sides, in the same order.

</details>

---

<details>
<summary><b>29. The chat history API data is paginated.</b></summary>

**How it works:**
Messages are loaded in pages of 30. The frontend automatically requests the next page when you scroll to the top of the history.

**How to verify:**

Call the backend endpoint directly:
```
GET http://localhost:8080/api/messages/{userId}?page=0&size=30
Authorization: Bearer {token}
```
Returns the 30 most recent messages. Call with `?page=1&size=30` for the next 30 older messages.

In the UI: click the **Load older messages** button at the top of a conversation to fetch the previous page.

</details>

---

<details>
<summary><b>30. The chat works in real time.</b></summary>

**How it works:**
Messages travel over the persistent WebSocket connection — no HTTP request is made to deliver a message to the other side.

**How to verify:**
1. Open a chat between two accounts in two browser windows side by side.
2. Type and send a message on one side.
3. It appears on the other side instantly — no page refresh, no delay.

</details>

---

<details>
<summary><b>31. An unread message icon appears when new chat messages are received in real time.</b></summary>

**How it works:**
When a message arrives for a chat that is not currently open, a red badge appears on that conversation in the sidebar and on the Chat nav link. It clears when the conversation is opened.

**How to verify:**
1. Log in as Account A and navigate to the Matcher page (away from Chat).
2. From Account B (second browser), send a message to Account A.
3. Account A sees a red unread badge on the Chat nav item — without refreshing the page.
4. Account A opens the chat — the badge disappears.

</details>

---

<details>
<summary><b>32. The real-time implementation does not rely on polling.</b></summary>

**How it works:**
A single WebSocket connection (STOMP over SockJS) is opened at login and kept alive for the entire session. All real-time events travel over this connection — messages, unread counts, connection notifications, online/offline status, and typing indicators. No endpoint is called on a timer.

**How to verify:**
1. Open DevTools → **Network tab** → filter by **WS**.
2. Log out, then log back in.
3. One WebSocket connection appears and stays open.
4. Switch the filter to **XHR** — there are no repeating requests to any endpoint.

</details>

---

<details>
<summary><b>33. The recommendations endpoint only returns a list of IDs.</b></summary>

**How it works:**
`GET /api/recommendations` returns a plain JSON array of integers. No user data is included — the frontend fetches each user's details with follow-up calls.

**How to verify:**
```
GET http://localhost:8080/api/recommendations
Authorization: Bearer {token}
```
Expected response:
```json
[4, 17, 23, 8, 51]
```

</details>

---

<details>
<summary><b>34. The connections endpoint only returns a list of IDs.</b></summary>

**How it works:**
Same pattern as recommendations — `GET /api/connections` returns only connected user IDs.

**How to verify:**
```
GET http://localhost:8080/api/connections
Authorization: Bearer {token}
```
Expected response:
```json
[7, 12]
```

</details>

---

<details>
<summary><b>35. The users endpoint returns a name and profile link.</b></summary>

**How it works:**
`GET /api/users/{id}` returns the display name, profile picture URL, and links to the profile and bio sub-resources.

**How to verify:**
```
GET http://localhost:8080/api/users/10
Authorization: Bearer {token}
```
Expected response:
```json
{
  "id": 10,
  "nickname": "ArcticOwl18",
  "profilePictureUrl": "/uploads/abc.jpg",
  "profileLink": "/api/users/10/profile",
  "bioLink": "/api/users/10/bio"
}
```

</details>

---

<details>
<summary><b>36. The profile endpoint returns "about me" type information.</b></summary>

**How it works:**
`GET /api/users/{id}/profile` returns the user's free-text "About me" field.

**How to verify:**
```
GET http://localhost:8080/api/users/10/profile
Authorization: Bearer {token}
```
Expected response:
```json
{
  "id": 10,
  "aboutMe": "Veteran gamer with 10+ years of experience..."
}
```

</details>

---

<details>
<summary><b>37. The bio endpoint returns biographical data.</b></summary>

**How it works:**
`GET /api/users/{id}/bio` returns public biographical fields. Private preference fields (preferred genders, age range, distance limit, GPS coordinates) are intentionally excluded — those are only available to the account owner via `GET /api/me/bio`.

**How to verify:**
```
GET http://localhost:8080/api/users/10/bio
Authorization: Bearer {token}
```

Response **includes:** `id`, `gender`, `dateOfBirth`, `timezone`, `timeRange`, `gamePreference`, `gameGenrePreference`, `lookingFor`, `platforms`, `intensity`, `country`, `city`

Response **does not include:** `preferredGenders`, `preferredAgeMin`, `preferredAgeMax`, `maxDistanceKm`, `latitude`, `longitude`

</details>

---

<details>
<summary><b>38. All user responses return an ID in the payload.</b></summary>

**How it works:**
Every user-related API response includes an `"id"` field at the root level.

**How to verify:**

| Endpoint | ID present |
|---|---|
| `GET /api/users/{id}` | `"id": 10` |
| `GET /api/users/{id}/profile` | `"id": 10` |
| `GET /api/users/{id}/bio` | `"id": 10` |
| `GET /api/me/account` | `"id": 10` |
| `GET /api/me/bio` | `"id": 10` |

</details>

---

<details>
<summary><b>39. The /me endpoint correctly shortcuts to the appropriate /users endpoint.</b></summary>

**How it works:**
`GET /api/me` returns HTTP 302 with a `Location` header pointing to `/api/users/{your-id}`. Clients can use `/me` without knowing their own ID.

**How to verify:**
```
GET http://localhost:8080/api/me
Authorization: Bearer {token}
```
Response: **HTTP 302**, `Location: /api/users/1`

Following the redirect returns the same response as `GET /api/users/{id}`.

</details>

---

<details>
<summary><b>40. The /users endpoint returns HTTP 404 when the ID is not found, including when the user is not allowed to see a profile.</b></summary>

**How it works:**
Both "user does not exist" and "user exists but caller is not allowed to view them" return `HTTP 404`. There is no `403 Forbidden` — a caller cannot tell whether a user exists at all, which prevents bad actors from enumerating profiles or learning who has blocked them.

**How to verify:**
1. `GET /api/users/99999` (non-existent ID) → **404**
2. `GET /api/users/{id}` for a real user you have no relationship with → **404** (same response)
3. Send a connection request to that user → now `GET /api/users/{id}` → **200**

</details>

---

<details>
<summary><b>41. The backend is implemented using the primary language from Coding Fundamentals (Java).</b></summary>

The entire backend is written in **Java 17** using **Spring Boot 4.0.3**.

Source: `backend/src/main/java/com/example/web/`

</details>

---

<details>
<summary><b>42. The frontend is implemented in React using TypeScript.</b></summary>

The entire frontend is written in **React 19** with **TypeScript 5.9**, bundled by **Vite 7**.

Source: `frontend/src/`

</details>

---

<details>
<summary><b>43. A PostgreSQL database is used as the primary application database.</b></summary>

All data is persisted in PostgreSQL. Hibernate manages the schema automatically.

Configuration (`backend/src/main/resources/application.properties`):
```
spring.datasource.url=jdbc:postgresql://localhost:5432/webdb
spring.datasource.username=root
spring.datasource.password=root
```

</details>

---

<details>
<summary><b>44. The application is secure. Information is appropriately shown to the correct authenticated users only.</b></summary>

**How it works:**
- All routes except `/api/auth/*` and `/api/seed` require a valid JWT.
- The JWT is validated on every request by a Spring Security filter.
- Private data (email, preferences) is only returned to the account owner.
- Profile data is gated by relationship status — all others get 404.
- Passwords are hashed with bcrypt before storage.

**How to verify:**
1. Call any protected endpoint without a token → **401 Unauthorized**.
2. Call `GET /api/me/account` with User A's token — it returns User A's email, not User B's.
3. Call `GET /api/users/{id}/bio` — no preferences or coordinates are included.

</details>

---

<details>
<summary><b>45. The application is responsive for mobile and desktop browsers.</b></summary>

**How it works:**
The layout uses Tailwind CSS responsive breakpoints. On small screens: navigation collapses, the chat sidebar hides when a conversation is open, forms stack vertically.

**How to verify:**
Open the app and use DevTools device simulation (F12 → toggle device toolbar) to switch between mobile and desktop sizes. All pages remain fully usable on both.

</details>

---

<details>
<summary><b>46. A method was provided to load fictitious users into the system (minimum 100).</b></summary>

**How it works:**
The seed endpoint creates **120 users** with varied profiles across locations in Estonia, Latvia, Lithuania, Finland, Germany, Poland, USA, Canada, Japan, and South Korea.

```
POST http://localhost:8080/api/seed
```

Seed users: `test10@test.com` → `test129@test.com`, password: `1234`

Idempotent — skips creation if 100+ users already exist. To reset:
```
DELETE http://localhost:8080/api/seed
POST   http://localhost:8080/api/seed
```

</details>

---

## Extra Criteria

<details>
<summary><b>The user experience is excellent, usable, and well-designed.</b></summary>

- Consistent amber/dark color theme across all pages.
- Clear navigation with active state highlighting.
- Inline validation messages on all forms.
- Empty states on all data-fetching pages.
- Responsive layout for both mobile and desktop.
- All interactive elements have visible hover and focus states.

</details>

---

<details>
<summary><b>An online/offline indicator is shown on profile and chat views.</b></summary>

**How it works:**
When a user connects, their email is added to an in-memory set. A WebSocket event notifies all connected users. On disconnect, another event broadcasts the offline status.

**How to verify:**
1. Log in on two accounts in two browsers.
2. Both see a **green dot** on each other's avatars in Matcher, Connections, and Chat.
3. Log out on one account — the other sees the dot turn **grey** within seconds.

</details>

---

<details>
<summary><b>A typing in progress indicator is shown.</b></summary>

**How it works:**
When a user starts typing, a typing event is sent over WebSocket to the other user. The indicator disappears after 2 seconds of inactivity or when the message is sent.

**How to verify:**
1. Open a chat between two accounts (two browsers).
2. Start typing on Account A's side.
3. Account B sees **"typing..."** appear.
4. Stop typing — the indicator disappears after 2 seconds.

</details>

---

<details>
<summary><b>The recommendation algorithm is exceptional.</b></summary>

Key points that distinguish the algorithm:

- Hard filters and scoring are both applied **in both directions** — a user cannot appear in your recommendations unless your profile also satisfies their filters.
- Time overlap is calculated in **UTC** to handle cross-timezone matching correctly, including midnight wrap-around.
- Multiple independent scoring factors with distinct weights produce nuanced ranking — two users who share games but differ in timezone score differently than two who match on everything.

See the **Matching Algorithm** section in [Readme.md](Readme.md) for the full scoring table.

</details>

---

<details>
<summary><b>It implements proximity-based location filtering.</b></summary>

**How it works:**
Each user stores GPS coordinates (from browser Geolocation API or city search). Distance is calculated using the **Haversine formula**, which accounts for the curvature of the Earth. A match is only possible if both users are within each other's maximum radius.

**How to verify:**
Set max distance to 100 km and location to Tallinn, Estonia. Seed users also in Tallinn (~0 km away) appear. Seed users in Riga, Latvia (~300 km) do not.

</details>

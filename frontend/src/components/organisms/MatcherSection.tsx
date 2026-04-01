import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import MatcherCard from "./MatcherCard";

interface MatchUser {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
  games: string;
  gameGenres: string;
  platform: string;
  lookingFor: string;
  intensity: string;
  timeRange: string;
  aboutMe: string;
  matchedFields: string[];
}

// Maps backend field names to human-readable labels for the "complete your profile" message
const fieldLabels: Record<string, string> = {
  dateOfBirth: "Date of birth",
  country: "Country",
  games: "Games",
  gameGenres: "Game genres",
  platform: "Platform",
  lookingFor: "Looking for",
  intensity: "Intensity",
  timeRange: "Time range",
  aboutMe: "About me"
};

// Splits "Valorant, CS2" into a lowercase set for comparison
function parseSet(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean));
}

// Computes which fields overlap between the current user's bio and a candidate's bio
function computeMatchedFields(myBio: Record<string, string>, candidateBio: Record<string, string>): string[] {
  const matched: string[] = [];
  const hasCommon = (a: string, b: string) => {
    const sa = parseSet(a); const sb = parseSet(b);
    return [...sa].some(v => sb.has(v));
  };
  if (hasCommon(myBio.gamePreference, candidateBio.gamePreference)) matched.push("games");
  if (hasCommon(myBio.gameGenrePreference, candidateBio.gameGenrePreference)) matched.push("gameGenres");
  if (hasCommon(myBio.platforms, candidateBio.platforms)) matched.push("platform");
  if (hasCommon(myBio.lookingFor, candidateBio.lookingFor)) matched.push("lookingFor");
  if (myBio.intensity && myBio.intensity.toLowerCase() === candidateBio.intensity?.toLowerCase()) matched.push("intensity");
  if (myBio.timeRange && candidateBio.timeRange) matched.push("timeRange");
  return matched;
}

export default function MatcherSection() {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { token } = useAuth();

  // Fetch all data for a single user by combining the three user endpoints
  async function fetchUserDetails(id: number, token: string, myBio: Record<string, string>): Promise<MatchUser | null> {
    try {
      const [summaryRes, bioRes, profileRes] = await Promise.all([
        fetch(`http://localhost:8080/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:8080/api/users/${id}/bio`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:8080/api/users/${id}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!summaryRes.ok || !bioRes.ok || !profileRes.ok) return null;
      const summary = await summaryRes.json();
      const bio = await bioRes.json();
      const profile = await profileRes.json();
      return {
        id: summary.id,
        nickname: summary.nickname,
        avatarUrl: summary.profilePictureUrl || null,
        country: bio.location ?? "",
        dateOfBirth: bio.dateOfBirth ?? "",
        games: bio.gamePreference ?? "",
        gameGenres: bio.gameGenrePreference ?? "",
        platform: bio.platforms ?? "",
        lookingFor: bio.lookingFor ?? "",
        intensity: bio.intensity ?? "",
        timeRange: bio.timeRange ?? "",
        aboutMe: profile.aboutMe ?? "",
        matchedFields: computeMatchedFields(myBio, bio),
      };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    async function loadMatches() {
      try {
        // Step 1: check if profile is complete
        const completeRes = await fetch("http://localhost:8080/api/recommendations/complete", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!completeRes.ok) return;
        const completeData = await completeRes.json();
        if (!completeData.complete) {
          setMissingFields(completeData.missingFields ?? []);
          setMatches([]);
          return;
        }
        setMissingFields([]);

        // Step 2: fetch current user's own bio for matched fields comparison
        const myBioRes = await fetch("http://localhost:8080/api/me/bio", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myBio = myBioRes.ok ? await myBioRes.json() : {};

        // Step 3: get the list of recommended IDs
        const idsRes = await fetch("http://localhost:8080/api/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!idsRes.ok) return;
        const ids: number[] = await idsRes.json();

        // Step 4: fetch full details for each ID in parallel, with matched fields
        const users = await Promise.all(ids.map(id => fetchUserDetails(id, token!, myBio)));
        setMatches(users.filter((u): u is MatchUser => u !== null));
      } catch {
        console.log("Can't load matches. Server is unreachable!");
      }
    }
    loadMatches();

    const interval = setInterval(loadMatches, 2000);
    return () => clearInterval(interval);
  }, [token]);

  // Send a connection request to the user
  async function handleConnect(id: number) {
    setMatches(matches.filter(item => item.id !== id));
    try {
      await fetch(`http://localhost:8080/api/connections/request/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      console.log("Can't connect to user. Server is unreachable!");
    }
  }

  // Block the user so they never appear in recommendations again
  async function handleDismiss(id: number) {
    setMatches(matches.filter(item => item.id !== id));
    try {
      await fetch(`http://localhost:8080/api/connections/block/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      console.log("Can't dismiss user. Server is unreachable!");
    }
  }

  // Show which fields are missing if profile is incomplete
  if (missingFields.length > 0) {
    return (
      <div className="bg-amber-500 rounded-xl px-6 py-8 max-w-sm">
        <p className="text-amber-950 font-bold text-lg mb-2">Your profile is incomplete</p>
        <p className="text-amber-800 text-sm mb-3">Fill in the following fields to start finding matches:</p>
        <ul className="flex flex-col gap-1">
          {missingFields.map(field => (
            <li key={field} className="bg-amber-950 text-amber-300 text-sm rounded-md px-3 py-1">
              {fieldLabels[field] ?? field}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (matches.length === 0) {
    return <p className="text-amber-800">No matches found. Try updating your preferences.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map(user => (
        <div key={user.id}>
          <MatcherCard
            user={user}
            onConnect={handleConnect}
            onDismiss={handleDismiss}
          />
        </div>
      ))}
    </div>
  );
}

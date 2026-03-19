import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import MatcherCard from "../organisms/MatcherCard";

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
  gameTimeFrom: string;
  gameTimeTo: string;
  matchedFields: string[];
}

const fieldLabels: Record<string, string> = {
  dateOfBirth: "Date of birth",
  gender: "Gender",
  country: "Country",
  aboutMe: "About me",
  games: "Games",
  gameGenres: "Game genres",
  platform: "Platform",
  lookingFor: "Looking for",
  intensity: "Intensity",
  gameTimeFrom: "Game time (from)",
  gameTimeTo: "Game time (to)",
};

export default function MatcherPage() {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch("http://localhost:8080/api/matches", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMissingFields(data.missingFields ?? []);
          setMatches(data.matches);
        }
      } catch {
        // Server unreachable
      }
    }
    loadMatches();
  }, [token]);

  async function handleConnect(id: number) {
    setMatches(prev => prev.filter(u => u.id !== id));
    try {
      await fetch(`http://localhost:8080/api/connections/${id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      // Server unreachable
    }
  }

  function handleDismiss(id: number) {
    setMatches(prev => prev.filter(u => u.id !== id));
  }

  return (
    <div className="min-h-screen bg-amber-300 px-6 py-10">
      <h1 className="text-amber-950 text-2xl font-bold mb-6">Recommended Matches</h1>

      {missingFields.length > 0 ? (
        <div className="bg-amber-500 rounded-xl px-6 py-8 max-w-sm">
          <p className="text-amber-950 font-bold text-lg mb-2">Your profile is incomplete</p>
          <p className="text-amber-800 text-sm mb-3">Fill in the following fields to start finding matches:</p>
          <ul className="flex flex-col gap-1">
            {missingFields.map(field => (
              <li key={field} className="bg-amber-950 text-amber-300 text-sm rounded-md px-3 py-1">{fieldLabels[field] ?? field}</li>
            ))}
          </ul>
        </div>
      ) : matches.length === 0 ? (
        <p className="text-amber-800">No matches found. Try updating your preferences.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(user => (
            <MatcherCard
              key={user.id}
              user={user}
              onConnect={handleConnect}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}

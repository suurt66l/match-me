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
};

export default function MatcherSection() {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch("http://localhost:8080/api/recommendations", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (!data.complete) {
            setMissingFields(data.missingFields ?? []);
            setMatches([]);
          } else {
            setMissingFields([]);
            setMatches(data.matches);
          }
        }
      } catch {
        console.log("Server is unreachable!");
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
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  // Block the user so they never appear in recommendations again
  async function handleDismiss(id: number) {
    setMatches(matches.filter(item => item.id !== id));
    try {
      await fetch(`http://localhost:8080/api/connections/block/${id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
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
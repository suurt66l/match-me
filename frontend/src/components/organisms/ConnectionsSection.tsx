import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import PendingCard from "./PendingCard";
import SentCard from "./SentCard";
import ConnectionCard from "./ConnectionCard";

interface UserData {
  connectionId: number;
  requesterId: number;
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


export default function ConnectionsSection() {
  const [connections, setConnections] = useState<UserData[]>([]);
  const [pending, setPending] = useState<UserData[]>([]);
  const [sent, setSent] = useState<UserData[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    loadConnections();
    loadPending();
    loadSent();

    const interval = setInterval(() => {
      loadConnections();
      loadPending();
      loadSent();
    }, 2000);

    return () => clearInterval(interval);
  }, [token]);

  async function fetchUserDetails(id: number): Promise<UserData | null> {
    try {
      const [summaryRes, bioRes, profileRes] = await Promise.all([
        fetch(`http://localhost:8080/api/users/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`http://localhost:8080/api/users/${id}/bio`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`http://localhost:8080/api/users/${id}/profile`, { headers: { "Authorization": `Bearer ${token}` } }),
      ]);
      if (!summaryRes.ok || !bioRes.ok || !profileRes.ok) return null;
      const summary = await summaryRes.json();
      const bio = await bioRes.json();
      const profile = await profileRes.json();
      return {
        connectionId: 0,
        requesterId: 0,
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
        matchedFields: [],
      };
    } catch {
      return null;
    }
  }

  async function loadConnections() {
    try {
      // Fetch IDs only, then load details for each
      const response = await fetch("http://localhost:8080/api/connections", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const ids: number[] = await response.json();
        const users = await Promise.all(ids.map(id => fetchUserDetails(id)));
        setConnections(users.filter((u): u is UserData => u !== null));
      }
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function loadPending() {
    try {
      const response = await fetch("http://localhost:8080/api/connections/pending", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPending(data);
      }
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function loadSent() {
    try {
      const response = await fetch("http://localhost:8080/api/connections/pending/sent", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSent(data);
      }
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function cancelRequest(connectionId: number) {
    setSent(sent.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`http://localhost:8080/api/connections/reject/${connectionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function removeConnection(userId: number) {
    setConnections(connections.filter(item => item.id !== userId));
    try {
      await fetch(`http://localhost:8080/api/connections/with/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  // Block the user so they never appear in recommendations again
  async function blockConnection(id: number) {
    setConnections(connections.filter(item => item.id !== id));
    try {
      await fetch(`http://localhost:8080/api/connections/block/${id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function acceptRequest(connectionId: number) {
    setPending(pending.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`http://localhost:8080/api/connections/accept/${connectionId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function rejectRequest(connectionId: number) {
    setPending(pending.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`http://localhost:8080/api/connections/reject/${connectionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">

      {/* Pending incoming requests */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-amber-950 font-bold text-lg mb-3">Pending requests</h2>
          <div className="flex flex-col gap-3">
            {pending.map(user => (
              <div key={user.connectionId}>
                <PendingCard
                  user={user}
                  onAccept={() => acceptRequest(user.connectionId)}
                  onDismiss={() => rejectRequest(user.connectionId)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing pending requests */}
      {sent.length > 0 && (
        <div>
          <h2 className="text-amber-950 font-bold text-lg mb-3">Sent requests</h2>
          <div className="flex flex-col gap-3">
            {sent.map(user => (
              <div key={user.id}>
                <SentCard
                  user={user}
                  onCancel={() => cancelRequest(user.connectionId)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted connections */}
      {connections.length > 0 && (
        <div>
          {pending.length > 0 && <h2 className="text-amber-950 font-bold text-lg mb-3">Connected</h2>}
          <div className="flex flex-col gap-3">
            {connections.map(user => (
              <div key={user.id}>
                <ConnectionCard
                  user={user}
                  onDismiss={() => removeConnection(user.id)}
                  onBlock={() => blockConnection(user.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nothing at all */}
      {connections.length === 0 && pending.length === 0 && sent.length === 0 && (
        <p className="text-amber-800">No connections yet. Go find some matches!</p>
      )}
    </div>
  );
}

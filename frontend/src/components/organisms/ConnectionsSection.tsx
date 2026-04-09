import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import { useWebSocket } from "../../utils/WebSocketContext";
import { API_URL } from "../../utils/api";
import PendingCard from "./PendingCard";
import SentCard from "./SentCard";
import ConnectionCard from "./ConnectionCard";

interface UserData {
  connectionId: number;
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  city: string;
  dateOfBirth: string;
  gender: string;
}


export default function ConnectionsSection() {
  const [connections, setConnections] = useState<UserData[]>([]);
  const [pending, setPending] = useState<UserData[]>([]);
  const [sent, setSent] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { client } = useWebSocket();

  useEffect(() => { 
    Promise.all([loadConnections(), loadPending(), loadSent()]).finally(() => setLoading(false));
  }, [token]);

  // Re-load when the backend signals a connection change (new request or accepted)
  useEffect(() => {
    if (!client) return;
    const sub = client.subscribe("/user/queue/connections", () => {
      loadConnections();
      loadPending();
      loadSent();
    });
    return () => sub.unsubscribe();
  }, [client]);

  async function fetchUserDetails(id: number): Promise<UserData | null> {
    try {
      const [summaryRes, bioRes] = await Promise.all([
        fetch(`${API_URL}/api/users/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/${id}/bio`, { headers: { "Authorization": `Bearer ${token}` } }),
      ]);

      if (!summaryRes.ok || !bioRes.ok) return null;

      const summary = await summaryRes.json();
      const bio = await bioRes.json();

      return {
        connectionId: 0,
        id: summary.id,
        nickname: summary.nickname,
        avatarUrl: summary.profilePictureUrl || null,
        country: bio.country ?? "",
        city: bio.city ?? "",
        dateOfBirth: bio.dateOfBirth ?? "",
        gender: bio.gender ?? ""
      };
    } catch {
      return null;
    }
  }

  /* For Sent Card */

  async function loadSent() {
    try {
      const response = await fetch(`${API_URL}/api/connections/pending/sent`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const pairs: { connectionId: number; userId: number }[] = await response.json();
        const users = await Promise.all(pairs.map(async ({ connectionId, userId }) => {
          const user = await fetchUserDetails(userId);
          return user ? { ...user, connectionId } : null;
        }));

        setSent(users.filter(u  => u !== null));
      }
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function cancelRequest(connectionId: number) {
    setSent(sent.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`${API_URL}/api/connections/reject/${connectionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  /* For pending Card */
  async function loadPending() {
    try {
      const response = await fetch(`${API_URL}/api/connections/pending`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const pairs = await response.json();
        const users = [];

        for (const pair of pairs) {
            const user = await fetchUserDetails(pair.userId);
            if (user) {
                users.push({ ...user, connectionId: pair.connectionId });
            }
        }
        setPending(users);
      }
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function acceptRequest(connectionId: number) {
    setPending(pending.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`${API_URL}/api/connections/accept/${connectionId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function removeConnection(userId: number) {
    setConnections(connections.filter(item => item.id !== userId));
    try {
      await fetch(`${API_URL}/api/connections/with/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  /* For Connection Card */
  // Block the user so they never appear in recommendations again
  async function loadConnections() {
    try {
      // Fetch IDs only, then load details for each
      const response = await fetch(`${API_URL}/api/connections`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const ids: number[] = await response.json();
        const users = await Promise.all(ids.map(id => fetchUserDetails(id)));
        setConnections(users.filter(u => u !== null));
      }
    } catch {
      console.log("Server is unreachable!");
    }
  }
/*
  async function rejectRequest(connectionId: number) {
    setPending(pending.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`${API_URL}/api/connections/reject/${connectionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }
*/
  async function blockConnection(id: number) {
    setConnections(connections.filter(item => item.id !== id));
    try {
      await fetch(`${API_URL}/api/connections/block/${id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch {
      console.log("Server is unreachable!");
    }
  }

  /* Actually renders page */
  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
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
                  onDismiss={() => cancelRequest(user.connectionId)}
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
          <h2 className="text-amber-950 font-bold text-lg mb-3">Connected</h2>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { ConnectionCard } from "./ConnectionCard";
import PendingCard from "./PendingCard";
import SentCard from "./SentCard";

interface Connection {
  connectionId: number;
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: number[];
}

interface PendingRequest {
  connectionId: number;
  requesterId: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: number[];
}


export default function ConnectionsSection() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [sent, setSent] = useState<PendingRequest[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

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

  async function loadConnections() {
    try {
      const response = await fetch("http://localhost:8080/api/connections", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
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

  async function removeConnection(connectionId: number) {
    setConnections(connections.filter(item => item.connectionId !== connectionId));
    try {
      await fetch(`http://localhost:8080/api/connections/dismiss/${connectionId}`, {
        method: "DELETE",
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
            {pending.map(request => (
              <PendingCard
                key={request.connectionId}
                user={request}
                onAccept={() => acceptRequest(request.connectionId)}
                onDismiss={() => rejectRequest(request.connectionId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Outgoing pending requests */}
      {sent.length > 0 && (
        <div>
          <h2 className="text-amber-950 font-bold text-lg mb-3">Sent requests</h2>
          <div className="flex flex-col gap-3">
            {sent.map(request => (
              <SentCard
                key={request.connectionId}
                user={request}
                onCancel={() => cancelRequest(request.connectionId)}
              />
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
                  onMessage={() => navigate(`/chat?with=${user.id}`)}
                  onDismiss={() => removeConnection(user.connectionId)}
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

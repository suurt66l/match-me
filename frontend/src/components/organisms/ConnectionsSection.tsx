import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { ConnectionCard } from "./ConnectionCard";

interface Connection {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
}

interface PendingRequest {
  connectionId: number;
  requesterId: number;
  nickname: string;
  avatarUrl: string | null;
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

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadConnections();
        loadPending();
        loadSent();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    try {
      await fetch(`http://localhost:8080/api/connections/reject/${connectionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setSent(sent.filter(item => item.connectionId !== connectionId));
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function removeConnection(id: number) {
    try {
      await fetch(`http://localhost:8080/api/connections/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setConnections(connections.filter(item => item.id !== id));
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function acceptRequest(connectionId: number) {
    try {
      await fetch(`http://localhost:8080/api/connections/accept/${connectionId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setPending(pending.filter(item => item.connectionId !== connectionId));
      loadConnections(); // reload accepted connections
    } catch {
      console.log("Server is unreachable!");
    }
  }

  async function rejectRequest(connectionId: number) {
    try {
      await fetch(`http://localhost:8080/api/connections/reject/${connectionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      setPending(pending.filter(item => item.connectionId !== connectionId));
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
              <div key={request.connectionId} className="bg-amber-500 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={request.avatarUrl ?? "/assets/default-avatar.svg"}
                    className="w-10 h-10 rounded-full object-cover bg-amber-950"
                  />
                  <span className="text-amber-950 font-semibold">{request.nickname}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(request.connectionId)}
                    className="bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(request.connectionId)}
                    className="bg-red-800 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-900 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
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
            {sent.map(request => (
              <div key={request.connectionId} className="bg-amber-400 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={request.avatarUrl ?? "/assets/default-avatar.svg"}
                    className="w-10 h-10 rounded-full object-cover bg-amber-950"
                  />
                  <span className="text-amber-950 font-semibold">{request.nickname}</span>
                </div>
                <button
                  onClick={() => cancelRequest(request.connectionId)}
                  className="bg-amber-950 text-amber-300 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-900 transition-colors"
                >
                  Cancel
                </button>
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
                  onMessage={() => navigate(`/chat?with=${user.id}`)}
                  onDismiss={() => removeConnection(user.id)}
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

interface Connection {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
}

function calcAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) age--;
  return age;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
        // Server unreachable
      }
    }
    loadConnections();
  }, [token]);

  return (
    <div className="min-h-screen bg-amber-300 px-6 py-10">
      <h1 className="text-amber-950 text-2xl font-bold mb-6">Connections</h1>

      {connections.length === 0 ? (
        <p className="text-amber-800">No connections yet. Go find some matches!</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-lg">
          {connections.map(user => (
            <div key={user.id} className="flex items-center gap-4 bg-amber-500 rounded-xl px-5 py-4">

              <div className="w-12 h-12 rounded-full bg-amber-950 overflow-hidden shrink-0">
                <img
                  src={user.avatarUrl ?? "/assets/default-avatar.svg"}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="text-amber-950 font-bold">{user.nickname}</p>
                <p className="text-amber-800 text-sm">
                  {user.country}{user.dateOfBirth ? `, ${calcAge(user.dateOfBirth)}` : ""}
                </p>
              </div>

              <button
                onClick={() => navigate(`/chat?with=${user.id}`)}
                className="rounded-md bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-900"
              >
                Message
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

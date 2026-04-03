import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { API_URL } from "../../utils/api";
import UserCard from "../organisms/UserCard";
import ConnectButton from "../atoms/ConnectButton";
import DismissButton from "../atoms/DismissButton";

interface ProfileData {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
  gender: string;
  games: string;
  gameGenres: string;
  platform: string;
  lookingFor: string;
  intensity: string;
  timeRange: string;
  aboutMe: string;
}

// Relationship of the current user to the profile being viewed
type Relationship = "connected" | "pending_sent" | "pending_received" | "none";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [relationship, setRelationship] = useState<Relationship>("none");
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    async function load() {
      try {
        const [summaryRes, bioRes, profileRes, connectionsRes, pendingRes, sentRes] = await Promise.all([
          fetch(`${API_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/users/${id}/bio`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/users/${id}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/connections`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/connections/pending`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/connections/pending/sent`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!summaryRes.ok) { setLoading(false); return; }

        const summary = await summaryRes.json();
        const bio = bioRes.ok ? await bioRes.json() : {};
        const prof = profileRes.ok ? await profileRes.json() : {};

        setProfile({
          id: summary.id,
          nickname: summary.nickname,
          avatarUrl: summary.profilePictureUrl || null,
          country: bio.country ?? bio.location ?? "",
          dateOfBirth: bio.dateOfBirth ?? "",
          gender: bio.gender ?? "",
          games: bio.gamePreference ?? "",
          gameGenres: bio.gameGenrePreference ?? "",
          platform: bio.platforms ?? "",
          lookingFor: bio.lookingFor ?? "",
          intensity: bio.intensity ?? "",
          timeRange: bio.timeRange ?? "",
          aboutMe: prof.aboutMe ?? "",
        });

        // Determine relationship to show the correct action buttons
        const userId = Number(id);
        const connectedIds: number[] = connectionsRes.ok ? await connectionsRes.json() : [];
        if (connectedIds.includes(userId)) { setRelationship("connected"); return; }

        const pending: { connectionId: number; userId: number }[] = pendingRes.ok ? await pendingRes.json() : [];
        const pendingMatch = pending.find(c => c.userId === userId);
        if (pendingMatch) { setRelationship("pending_received"); setConnectionId(pendingMatch.connectionId); return; }

        const sent: { connectionId: number; userId: number }[] = sentRes.ok ? await sentRes.json() : [];
        const sentConn = sent.find(c => c.userId === userId);
        if (sentConn) { setRelationship("pending_sent"); setConnectionId(sentConn.connectionId); return; }

        setRelationship("none");
      } catch { /* unreachable */ }
      finally { setLoading(false); }
    }

    load();
  }, [id, token]);

  async function handleConnect() {
    await fetch(`${API_URL}/api/connections/request/${id}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    setRelationship("pending_sent");
  }

  async function handleAccept() {
    if (!connectionId) return;
    await fetch(`${API_URL}/api/connections/accept/${connectionId}`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}` },
    });
    setRelationship("connected");
  }

  async function handleDismiss() {
    await fetch(`${API_URL}/api/connections/block/${id}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    navigate(-1);
  }

  if (loading) return <div className="p-8 text-amber-800">Loading...</div>;
  if (!profile) return <div className="p-8 text-amber-800">Profile not found.</div>;

  return (
    <div className="p-6 max-w-lg mx-auto flex flex-col gap-4">
      <button onClick={() => navigate(-1)} className="text-amber-800 text-sm hover:underline self-start">
        ← Back
      </button>

      {/* Reuse UserCard — shows all fields, no matchedOnly filter */}
      <UserCard user={{ ...profile, matchedFields: [] }}>

        {relationship === "connected" && (
          <button
            onClick={() => navigate(`/chat?with=${profile.id}`)}
            className="flex-1 rounded-md bg-amber-950 px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-800"
          >
            Message
          </button>
        )}

        {relationship === "none" && (
          <>
            <ConnectButton onConnect={handleConnect} />
            <DismissButton onDismiss={handleDismiss} />
          </>
        )}

        {relationship === "pending_sent" && (
          <p className="text-amber-800 text-sm self-center">Request sent — waiting for response.</p>
        )}

        {relationship === "pending_received" && (
          <ConnectButton onConnect={handleAccept} />
        )}

      </UserCard>
    </div>
  );
}

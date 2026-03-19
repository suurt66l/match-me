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

interface Props {
  user: MatchUser;
  onConnect: (id: number) => void;
  onDismiss: (id: number) => void;
}

const lookingForLabels: Record<string, string> = {
  "for-play":         "Play together",
  "for-friendship":   "Friendship",
  "for-chat":         "Just to chat",
  "for-irl-relations":"Relationships IRL",
};

const platformLabels: Record<string, string> = {
  "pc":          "PC",
  "playstation": "PlayStation",
  "xbox":        "Xbox",
  "nintendo":    "Nintendo",
  "other":       "Other",
};

function calcAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

interface StatRowProps {
  label: string;
  value: string;
  highlighted: boolean;
}

function StatRow({ label, value, highlighted }: StatRowProps) {
  return (
    <div className={`flex justify-between rounded-lg px-3 py-1.5 text-sm ${highlighted ? "bg-amber-950 text-amber-300 font-semibold" : "bg-amber-400 text-amber-950"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function MatcherCard({ user, onConnect, onDismiss }: Props) {
  const age = user.dateOfBirth ? calcAge(user.dateOfBirth) : null;
  const matched = new Set(user.matchedFields);

  return (
    <div className="flex flex-col gap-4 bg-amber-500 rounded-xl px-6 py-6">

      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-950 overflow-hidden flex-shrink-0">
          <img
            src={user.avatarUrl ?? "/assets/default-avatar.svg"}
            alt={user.nickname}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-amber-950 font-bold text-lg">{user.nickname}</p>
          <p className="text-amber-800 text-sm">{user.country}{age !== null ? `, ${age}` : ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1.5">
        {user.games      && <StatRow label="Games"       value={user.games}       highlighted={matched.has("games")} />}
        {user.gameGenres && <StatRow label="Genres"      value={user.gameGenres}  highlighted={matched.has("gameGenres")} />}
        {user.platform   && <StatRow label="Platform"    value={platformLabels[user.platform] ?? user.platform}      highlighted={matched.has("platform")} />}
        {user.lookingFor && <StatRow label="Looking for" value={lookingForLabels[user.lookingFor] ?? user.lookingFor} highlighted={matched.has("lookingFor")} />}
        {user.intensity  && <StatRow label="Intensity"   value={`${user.intensity} / 10`} highlighted={matched.has("intensity")} />}
        {(user.gameTimeFrom || user.gameTimeTo) && (
          <StatRow
            label="Play time"
            value={`${user.gameTimeFrom} – ${user.gameTimeTo}`}
            highlighted={matched.has("gameTimeFrom") || matched.has("gameTimeTo")}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => onDismiss(user.id)}
          className="flex-1 rounded-md bg-red-800 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Dismiss
        </button>
        <button
          onClick={() => onConnect(user.id)}
          className="flex-1 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600"
        >
          Connect
        </button>
      </div>
    </div>
  );
}

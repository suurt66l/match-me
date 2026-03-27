import { useState } from "react";
import CalculateAge from "../../utils/mini/CalculateAge";
import ConnectButton from "../atoms/ConnectButton";
import DismissButton from "../atoms/DismissButton";
import MinBioBlock from "../molecules/MinBioBlock";

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
  const [expanded, setExpand] = useState<boolean>(false);
  
  const age = user.dateOfBirth ? CalculateAge(user.dateOfBirth) : null;
  const matched = new Set(user.matchedFields);

  return (
    <div className="flex flex-col gap-4 bg-amber-500 rounded-xl px-6 py-6">

      {/* Avatar + identity */}
      <MinBioBlock
        avatarUrl={user.avatarUrl}
        nickname={user.nickname}
        country={user.country}
        age={age}
      />

      {/* Stats */}
      <div className="flex flex-col gap-1.5">
        {user.games      && <StatRow label="Games"       value={user.games}       highlighted={matched.has("games")} />}
        {user.gameGenres && <StatRow label="Genres"      value={user.gameGenres}  highlighted={matched.has("gameGenres")} />}
        {user.platform   && <StatRow label="Platform"    value={platformLabels[user.platform] ?? user.platform}      highlighted={matched.has("platform")} />}
        {user.lookingFor && <StatRow label="Looking for" value={lookingForLabels[user.lookingFor] ?? user.lookingFor} highlighted={matched.has("lookingFor")} />}
        {user.intensity  && <StatRow label="Intensity"   value={`${user.intensity} / 10`} highlighted={matched.has("intensity")} />}
        {user.timeRange && <StatRow label="Play time" value={user.timeRange} highlighted={matched.has("timeRange")} />}
        {user.aboutMe && (
          <div title={user.aboutMe} className="rounded-lg text-sm text-amber-950">
            <div className="rounded-t-lg text-sm px-3 py-2 bg-amber-400">About Me</div>
              {user.aboutMe.length > 50 
                ? <>
                    <div className="rounded-b-lg px-3 py-2 bg-amber-300 cursor-pointer" onClick={() => setExpand(true)}>
                      {user.aboutMe.slice(0, 50)}
                      <span className="font-bold text-amber-700 cursor-pointer hover:text-amber-900"> . . . read more → </span>
                    </div>
                  </>
                : <>
                    <div className="rounded-b-lg px-3 py-2 bg-amber-300">
                      {user.aboutMe}
                    </div>
                  </>
              }

              {expanded && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setExpand(false)}>
                <div className="bg-amber-300 rounded-xl px-6 py-5 max-w-sm mx-4">
                  <p className="text-amber-950 text-sm">{user.aboutMe}</p>
                </div>
              </div>
              )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <DismissButton onDismiss={() => onDismiss(user.id)}/>
        <ConnectButton onConnect={() => onConnect(user.id)}/>
      </div>
    </div>
  );
}

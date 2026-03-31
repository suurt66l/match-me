import { useState } from "react";
import CalculateAge from "../../utils/mini/CalculateAge";
import MinBioBlock from "../molecules/MinBioBlock";
import AboutMeBlock from "../molecules/AboutMeBlock";

interface UserData {
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
  matchedFields?: string[];
}

interface Props {
  user: UserData;
  children: React.ReactNode;
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

export default function UserCard({ user, children }: Props) {
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
        {user.platform   && <StatRow label="Platform"    value={user.platform}      highlighted={matched.has("platform")} />}
        {user.lookingFor && <StatRow label="Looking for" value={user.lookingFor} highlighted={matched.has("lookingFor")} />}
        {user.intensity  && <StatRow label="Intensity"   value={`${user.intensity} / 10`} highlighted={matched.has("intensity")} />}
        {user.timeRange && <StatRow label="Play time" value={user.timeRange} highlighted={matched.has("timeRange")} />}
        {user.aboutMe && ( <AboutMeBlock aboutMe={user.aboutMe} expanded={expanded} setExpand={setExpand}/>)}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        {children}
      </div>
    </div>
  );
}

import { useState } from "react";
import CalculateAge from "../../utils/mini/CalculateAge";
import MinBioBlock from "../molecules/MinBioBlock";
import AboutMeBlock from "../molecules/AboutMeBlock";

interface UserData {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  city?: string;
  dateOfBirth: string;
  gender?: string;
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
  matchedOnly?: boolean;
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

export default function UserCard({ user, children, matchedOnly = false }: Props) {
  const [expanded, setExpand] = useState<boolean>(false);

  const age = user.dateOfBirth ? CalculateAge(user.dateOfBirth) : null;
  const matched = new Set(user.matchedFields);

  // Checks the current mode (matchedOnly),  if it's activated displays only matchedFields
  const shouldDisplayField = (field: string, value: string) => {
      // If user didn't filled the field
      if (!value) return false;
      // If user hasn't matched fields in matchedOnly mode.
      if (matchedOnly && !matched.has(field)) return false;
      return true;
  };

  return (
    <div className="flex flex-col gap-4 bg-amber-500 rounded-xl px-6 py-6">
      {/* Avatar + identity — gender passed through to show below country/age */}
      <MinBioBlock
        avatarUrl={user.avatarUrl}
        nickname={user.nickname}
        country={user.country}
        city={user.city}
        age={age}
        gender={user.gender}
      />

      {/* Stats — highlighted rows are fields that match the viewer's own bio */}
      <div className="flex flex-col gap-1.5">
        { shouldDisplayField("games", user.games) && <StatRow label="Games"       value={user.games}                    highlighted={matched.has("games")} />}
        { shouldDisplayField("gameGenres", user.gameGenres) && <StatRow label="Genres"      value={user.gameGenres}               highlighted={matched.has("gameGenres")} />}
        { shouldDisplayField("platform", user.platform) && <StatRow label="Platform"    value={user.platform}                 highlighted={matched.has("platform")} />}
        { shouldDisplayField("lookingFor", user.lookingFor) && <StatRow label="Looking for" value={user.lookingFor}               highlighted={matched.has("lookingFor")} />}
        { shouldDisplayField("intensity", user.intensity) && <StatRow label="Intensity"   value={`${user.intensity} / 10`}      highlighted={matched.has("intensity")} />}
        { shouldDisplayField("timeRange", user.timeRange)  && <StatRow label="Play time"   value={user.timeRange}                highlighted={matched.has("timeRange")} />}
        {(user.aboutMe  && !matchedOnly)  && <AboutMeBlock aboutMe={user.aboutMe} expanded={expanded} setExpand={setExpand}/>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        {children}
      </div>
    </div>
  );
}

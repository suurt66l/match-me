import { useNavigate } from "react-router-dom";
import DismissButton from "../atoms/DismissButton";
import UserCard from "./UserCard";
import BlockButton from "../atoms/BlockButton";

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
  matchedFields: string[];
}

interface Props {
  user: UserData;
  onDismiss: (id: number) => void;
  onBlock: (id: number) => void;
}

export default function ConnectionCard({ user, onDismiss, onBlock }: Props) {
  const navigate = useNavigate();

  return (
    <UserCard user={user}>
      <button
        onClick={() => navigate(`/chat?with=${user.id}`)}
        className="px-3 py-1.5 rounded-md text-sm font-semibold bg-amber-950 text-amber-300 hover:bg-amber-800"
      >
        Message
      </button>
      <DismissButton onDismiss={() => onDismiss(user.id)} />
      <BlockButton onBlock={() => onBlock(user.id)} />
    </UserCard>
  );
}

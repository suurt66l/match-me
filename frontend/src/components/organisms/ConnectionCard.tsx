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
  return (
    <UserCard user={user}>
      <DismissButton onDismiss={() => onDismiss(user.id)} />
      <BlockButton onBlock={() => onBlock(user.id)} />
    </UserCard>
  );
}
